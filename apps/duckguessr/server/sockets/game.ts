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
import { getGameWithRoundsDatasetPlayers } from '../game'
import { predict } from '../predict'
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
  username: string,
  roundId: number,
  personcode: string | null
) {
  console.log(`${username} is guessing ${JSON.stringify(personcode)} on round ${roundId}`)
  try {
    const guessResultsData = await round.guess(
      await prisma.player.findFirst({
        where: {
          username,
        },
      }),
      roundId,
      { personcode }
    )
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

const guessWithNullAtEndOfRound = (socket: Socket, round: Index.round) => {
  console.log('guessWithNullAtEndOfRound ' + round.id)
  doOnRoundFinish(round, async ({ game_id, id }: Index.round) => {
    console.log('Round ' + id + ' finished')
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
      console.log(username + ' is missing a score')
      await onGuess.apply(socket, [username, id, null])
    }
  })
}

const playRoundAsBot = (
  round: any,
  game: Prisma.PromiseReturnType<typeof getGameWithRoundsDatasetPlayers>,
  socket: Socket,
  botUsername: string
) => {
  doOnRoundStart(round, (round: Index.round) => {
    const possibleAuthors = game!.rounds
      .filter(
        ({ round_number: roundNumber }) =>
          roundNumber === null || roundNumber >= round.round_number!
      )
      .map(({ personcode }) => personcode)
    predict(round.round_number!, round.sitecode_url, game!.dataset, possibleAuthors).then(
      (personcode: any) => {
        onGuess.apply(socket, [botUsername, round.id, personcode])
      }
    )
  })
}

export const createGameSocket = (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  game: Prisma.PromiseReturnType<typeof getGameWithRoundsDatasetPlayers>
) => {
  if (game === null) {
    throw new Error('game is null')
  }
  return io.of(`/game/${game!.id}`).on('connection', (socket: Socket) => {
    console.log('connection')
    socket.on('guess', onGuess)

    const playableRounds = game!.rounds.filter(({ finished_at }) => !!finished_at)

    if (game.game_type === 'against_bot') {
      const botUsername = 'bot_us'
      for (const round of playableRounds) {
        playRoundAsBot(round, game, socket, botUsername)
      }
    }

    for (const round of playableRounds) {
      guessWithNullAtEndOfRound(socket, round)
    }
  })
}
