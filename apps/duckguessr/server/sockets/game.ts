import type Index from '@prisma/client'
import { Server, Socket } from 'socket.io'
import { PrismaClient, Prisma } from '@prisma/client'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { GuessResponse } from '../../types/guess'
import { getGameWithRoundsDatasetPlayers, numberOfRounds } from '../game'
import { predict } from '../predict'
import { getRoundWithScores } from '../round'
import { getPlayer } from '../get-player'
const round = require('../../server/round')

const prisma = new PrismaClient()

const doOnRoundStart = (round: Index.round, callback: Function) => {
  const now = new Date()
  setTimeout(() => callback(round), round.started_at!.getTime() - now.getTime())
}

const doOnRoundFinish = (round: Index.round, callback: Function) => {
  const now = new Date()
  setTimeout(() => callback(round), round.finished_at!.getTime() - now.getTime())
}

const onGuess = async function (
  this: Socket,
  user: Index.player,
  roundId: number,
  personcode: string | null
) {
  console.log(`${user.username} is guessing ${JSON.stringify(personcode)} on round ${roundId}`)
  try {
    const guessResultsData = await round.guess(user, roundId, { personcode })
    if (guessResultsData) {
      this.emit('playerGuessed', guessResultsData)
      this.broadcast.emit('playerGuessed', {
        ...guessResultsData,
        answer: null,
      } as GuessResponse)
    }
  } catch (e) {
    console.error(e)
  }
}

const initRoundEnds = (socket: Socket, round: Index.round) => {
  doOnRoundFinish(round, async ({ game_id, id }: Index.round) => {
    console.log(`Round ${id} finished`)
    const missingScores = (await prisma.$queryRaw`
        SELECT DISTINCT username
        FROM game_player
        INNER JOIN player ON game_player.player_id = player.id
        WHERE game_player.game_id = ${game_id} AND player_id NOT IN (
          SELECT player_id
          FROM round_score
          WHERE round_id = ${id}
        )
        GROUP BY username
      `) as Index.player[]
    for (const { username } of missingScores) {
      console.log(`${username} is missing a score`)
      await onGuess.apply(socket, [
        (await prisma.player.findUnique({ where: { username } }))!,
        id,
        null,
      ])
    }
    socket.broadcast.emit('roundEnds', await getRoundWithScores(id))
    socket.emit('roundEnds', await getRoundWithScores(id))
    if (round.round_number === numberOfRounds) {
      socket.broadcast.emit('gameEnds')
      socket.emit('gameEnds')
    }
  })
}

const initRoundStarts = (
  socket: Socket,
  round: any,
  game: Prisma.PromiseReturnType<typeof getGameWithRoundsDatasetPlayers>
) => {
  doOnRoundStart(round, async (round: Index.round) => {
    socket.broadcast.emit('roundStarts', { ...round, personcode: null })
    socket.emit('roundStarts', { ...round, personcode: null })
    const botPlayer = await game!.game_players
      .map(({ player }) => player)
      .find((player) => /^bot_/.test(player.username))
    if (botPlayer) {
      const possibleAuthors = game!.rounds
        .filter(
          ({ round_number: roundNumber }) =>
            roundNumber === null || roundNumber >= round.round_number!
        )
        .map(({ personcode }) => personcode)
      predict(round.round_number!, round.sitecode_url, game!.dataset, possibleAuthors).then(
        (personcode: any) => {
          onGuess.apply(socket, [botPlayer!, round.id, personcode])
        }
      )
    }
  })
}

export const createGameSocket = (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  game: Prisma.PromiseReturnType<typeof getGameWithRoundsDatasetPlayers>
) => {
  if (game === null) {
    throw new Error('game is null')
  }

  let areRoundsInitialized = false

  return io.of(`/game/${game!.id}`).on('connection', async (socket: Socket) => {
    const user = await getPlayer(socket.handshake.auth.cookie)

    if (areRoundsInitialized) {
      const currentRound = game!.rounds.find(
        ({ started_at, finished_at }) =>
          started_at && started_at < new Date() && finished_at && finished_at > new Date()
      )
      socket.emit('roundStarts', { ...currentRound, personcode: null })
    } else {
      areRoundsInitialized = true
      const playableRounds = game!.rounds.filter(
        ({ finished_at }) => !!finished_at && finished_at > new Date()
      )

      for (const round of playableRounds) {
        initRoundStarts(socket, round, game)
        initRoundEnds(socket, round)
      }
    }

    socket.on('guess', (roundId, personcode) => {
      onGuess.apply(socket, [user, roundId, personcode])
    })
  })
}
