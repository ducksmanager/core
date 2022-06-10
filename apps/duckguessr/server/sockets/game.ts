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
import { getRoundWithScores, setRoundTimes } from '../round'
import { getPlayer } from '../get-player'

const round = require('../../server/round')

const prisma = new PrismaClient()

export const createGameSocket = (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  game: Prisma.PromiseReturnType<typeof getGameWithRoundsDatasetPlayers>
) => {
  if (game === null) {
    console.error('game is null')
    return
  }

  let isFirstRoundStarted = false
  let currentRound: Index.round = game.rounds.find(
    ({ round_number }) => round_number === 1
  ) as Index.round
  let currentRoundEndTimeout: NodeJS.Timeout

  const onGuess = async function (
    this: Socket,
    user: Index.player,
    personcode: string | null
  ): Promise<boolean> {
    console.log(
      `${user.username} is guessing ${JSON.stringify(personcode)} on round ${currentRound.id}`
    )
    try {
      const guessResultsData = await round.guess(user, currentRound.id, { personcode })
      if (guessResultsData) {
        this.emit('playerGuessed', guessResultsData)
        this.broadcast.emit('playerGuessed', {
          ...guessResultsData,
          answer: null,
        } as GuessResponse)

        if (personcode !== null) {
          const haveAllPlayersGuessed = (await getPlayersMissingRoundScore()).length === 0

          if (haveAllPlayersGuessed) {
            clearTimeout(currentRoundEndTimeout)
            await finishRound(this)
            return true
          }
        }
      }
      return false
    } catch (e) {
      console.error(e)
      return false
    }
  }

  const getPlayersMissingRoundScore = async (): Promise<Index.player[]> =>
    await prisma.$queryRaw`
      SELECT DISTINCT username
      FROM game_player
             INNER JOIN player ON game_player.player_id = player.id
      WHERE game_player.game_id = ${currentRound.game_id}
        AND player_id NOT IN (SELECT player_id
                              FROM round_score
                              WHERE round_id = ${currentRound.id})
      GROUP BY username
    `

  const startRound = (socket: Socket) => {
    currentRoundEndTimeout = setTimeout(
      () => finishRound(socket),
      currentRound.finished_at!.getTime() - new Date().getTime()
    )

    setTimeout(async () => {
      socket.broadcast.emit('roundStarts', { ...currentRound, personcode: null })
      socket.emit('roundStarts', { ...currentRound, personcode: null })

      const botPlayer = (
        await prisma.game_player.findFirst({
          where: {
            game_id: currentRound.game_id,
            player: {
              username: {
                startsWith: 'bot',
              },
            },
          },
          include: {
            player: true,
          },
        })
      )?.player
      if (botPlayer) {
        const possibleAuthors = game!.rounds
          .filter(
            ({ round_number: roundNumber }) =>
              roundNumber === null || roundNumber >= currentRound.round_number!
          )
          .map(({ personcode }) => personcode)
        predict(currentRound, game!.dataset, possibleAuthors).then((personcode: any) =>
          onGuess.apply(socket, [botPlayer!, personcode])
        )
      }
    }, currentRound.started_at!.getTime() - new Date().getTime())
  }

  const finishRound = async (socket: Socket) => {
    console.log(`Round ${currentRound.id} finished`)
    const missingScores = await getPlayersMissingRoundScore()
    for (const { username } of missingScores) {
      console.log(`${username} is missing a score`)
      await onGuess.apply(socket, [
        (await prisma.player.findUnique({ where: { username } }))!,
        null,
      ])
    }
    const roundWithScores = await getRoundWithScores(currentRound.id)
    socket.broadcast.emit('roundEnds', roundWithScores, null)
    socket.emit('roundEnds', roundWithScores, null)
    if (currentRound.round_number === numberOfRounds) {
      socket.broadcast.emit('gameEnds')
      socket.emit('gameEnds')
    } else {
      currentRound = await setRoundTimes(
        game.rounds.find(
          ({ round_number }) => round_number === currentRound.round_number! + 1
        ) as Index.round
      )
      socket.broadcast.emit('roundEnds', roundWithScores, currentRound)
      socket.emit('roundEnds', roundWithScores, currentRound)
      startRound(socket)
    }
  }

  return io.of(`/game/${game!.id}`).on('connection', async (socket: Socket) => {
    const user = await getPlayer(socket.handshake.auth.cookie)

    if (!user) {
      return
    }

    if (isFirstRoundStarted) {
      socket.emit('roundStarts', { ...currentRound, personcode: null })
    } else {
      isFirstRoundStarted = true
      currentRound = await setRoundTimes(currentRound)
      startRound(socket)
    }

    socket.on('guess', async (personcode: string | null, callback: Function) => {
      const haveAllPlayersGuessed = await onGuess.apply(socket, [user!, personcode])
      if (haveAllPlayersGuessed) {
        callback(haveAllPlayersGuessed)
      }
    })
  })
}
