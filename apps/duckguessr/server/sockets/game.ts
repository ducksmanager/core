import { Server, Socket } from 'socket.io'
import Index, { PrismaClient } from '@prisma/client'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { getGameWithRoundsDatasetPlayers, numberOfRounds } from '../game'
import { getUser, getPlayer, getPlayerStatistics } from '../get-player'
import { MatchDetails } from '../../types/matchDetails'
import { getRoundWithScores, setRoundTimes } from '../round'
import { GuessResponse } from '../../types/guess'
import { predict } from '../predict'
const round = require('../../server/round')

const game = require('../game')

const prisma = new PrismaClient()

export function createMatchmakingSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  io.of('/match').on('connection', async (socket) => {
    const user = await getPlayer(socket.handshake.auth.cookie)
    if (!user) {
      console.log(`Can't find user for cookie ${JSON.stringify(socket.handshake.auth.cookie)}`)
      return false
    }

    socket.on('createMatch', async (dataset, callback) => {
      console.log(`${user.username} is creating a match`)
      const newGame = await game.create(dataset)
      await createGameSocket(io, newGame.id)
      callback(newGame.id)
    })
  })
}

export const createGameSocket = async (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  gameId: number
) => {
  let currentGame = await getGameWithRoundsDatasetPlayers(gameId)
  if (!currentGame) {
    console.error(`Game not found for ID ${gameId}`)
    return
  }
  let currentRound: Index.round = currentGame.rounds.find(
    ({ round_number }: Index.round) => round_number === 1
  ) as Index.round
  let currentRoundEndTimeout: NodeJS.Timeout

  const checkAndAssociatePlayer = async (player: Index.player) => {
    if (currentGame!.game_players.find(({ player_id }) => player_id === player.id)) {
      console.info(`Player ${player.username} is already associated with game ${currentGame!.id}`)
    } else {
      await game.associatePlayer(currentGame!.id, player)
      console.log(`${player.username} is ready in game ${currentGame!.id}`)
    }
    return player
  }

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

    if (currentRound.round_number === 1) {
      setTimeout(() => {
        socket.broadcast.emit('firstRoundWillStartSoon', currentRound.started_at!)
        socket.emit('firstRoundWillStartSoon', currentRound.started_at!)
      }, 200)
    }

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
        const possibleAuthors = currentGame!.rounds
          .filter(
            ({ round_number: roundNumber }: Index.round) =>
              roundNumber === null || roundNumber >= currentRound.round_number!
          )
          .map(({ personcode }: Index.round) => personcode)
        predict(currentRound, currentGame!.dataset, possibleAuthors).then((personcode: any) =>
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
        currentGame!.rounds.find(
          ({ round_number }: Index.round) => round_number === currentRound.round_number! + 1
        ) as Index.round
      )
      socket.broadcast.emit('roundEnds', roundWithScores, { ...currentRound, personcode: null })
      socket.emit('roundEnds', roundWithScores, { ...currentRound, personcode: null })
      startRound(socket)
    }
  }

  io.of(`/game/${gameId}`).on('connection', async (socket) => {
    const user = await getPlayer(socket.handshake.auth.cookie)
    if (!user) {
      console.log(`Can't find user for cookie ${JSON.stringify(socket.handshake.auth.cookie)}`)
      return false
    }

    const validateGameForBotAddOrRemove = () => {
      if (user!.id !== currentGame!.game_players[0].player_id) {
        console.error('Only the player creating the match can add or remove a bot!')
        return false
      }
    }

    const removePlayer = async (user: Index.player) => {
      if (!currentGame!.game_players.map(({ player }) => player.username).includes(user.username)) {
        console.log(`${user.username} is not part of the game`)
      } else {
        await game.disassociatePlayer(gameId, user)

        socket.broadcast.emit('playerLeft', user)
        socket.emit('playerLeft', user)
      }
    }

    socket.emit('playerConnectedToMatch')

    socket.on('removeBot', async () => {
      validateGameForBotAddOrRemove()
      await removePlayer(await getUser(`bot_${currentGame!.dataset.name}`))
      currentGame = await getGameWithRoundsDatasetPlayers(gameId)
    })

    socket.on('addBot', async () => {
      validateGameForBotAddOrRemove()

      const botUsername = `bot_${currentGame!.dataset.name}`
      const botPlayer = await getUser(botUsername)
      await checkAndAssociatePlayer(botPlayer)
      currentGame = await getGameWithRoundsDatasetPlayers(gameId)

      socket.broadcast.emit('playerJoined', botPlayer)
      socket.emit('playerJoined', botPlayer)
    })

    socket.on('joinMatch', async (callback: Function) => {
      const player = await checkAndAssociatePlayer(user)
      currentGame = (await getGameWithRoundsDatasetPlayers(gameId))!

      socket.broadcast.emit('playerJoined', player)

      const players = currentGame.game_players.map(({ player }) => player)

      // eslint-disable-next-line n/no-callback-literal
      callback({
        isBotAvailable: ['published-fr-recent', 'published-fr-small', 'it'].includes(
          currentGame.dataset.name
        ),
        players,
        playerStats: await getPlayerStatistics(players.map(({ id }) => id)),
      } as MatchDetails)
    })

    socket.on('startMatch', async () => {
      if (user.id !== currentGame!.game_players[0].player_id) {
        console.error('The player starting the match must be the one who created it!')
        return false
      }

      console.log(`Game ${gameId} is starting!`)

      currentRound = await setRoundTimes(currentRound)
      startRound(socket)

      currentGame = await getGameWithRoundsDatasetPlayers(gameId)

      socket.broadcast.emit('matchStarts')
      socket.emit('matchStarts')
    })

    socket.on('guess', async (personcode: string | null, callback: Function) => {
      const haveAllPlayersGuessed = await onGuess.apply(socket, [user!, personcode])
      if (haveAllPlayersGuessed) {
        callback(haveAllPlayersGuessed)
      }
    })

    socket.on('disconnect', async (reason: string) => {
      if (reason !== 'client namespace disconnect') {
        if (currentGame!.game_players.findIndex(({ player }) => player.id === user.id) > 0) {
          await removePlayer(user)
          currentGame = await getGameWithRoundsDatasetPlayers(gameId)
        }
      }
    })
  })
}
