import { Server } from 'socket.io'
import { Prisma } from '@prisma/client'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { getPlayer, getGameWithRoundsDatasetPlayers } from '../game'

const game = require('../game')
const round = require('../round')
const { createGameSocket } = require('./game')

const checkAndAssociatePlayer = async (
  username: string,
  password: string,
  currentGame: Prisma.PromiseReturnType<typeof getGameWithRoundsDatasetPlayers>
) => {
  const player = await game.getPlayer(username, password)
  if (player === null) {
    throw new Error(`Player ${username} has invalid credentials`)
  }
  if (currentGame!.game_players.find(({ player_id }) => player_id === player.id)) {
    console.info(`Player ${player.username} is already associated with game ${currentGame!.id}`)
  } else {
    await game.associatePlayer(currentGame!.id, player)
    console.log(`${username} is ready in game ${currentGame!.id}`)
  }
  return player
}

export function createMatchmakingSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  io.of('/matchmaking').on('connection', (socket) => {
    console.log('a player is creating a match')
    socket.on('iAmReady', async (gameType, dataset, username, password, callback) => {
      const currentGame = await game.create(gameType, dataset)
      const player = await checkAndAssociatePlayer(username, password, currentGame)

      if (gameType === 'against_bot') {
        const botUsername = `bot_${currentGame.dataset.name}`
        const botPlayer = await getPlayer(botUsername)
        await game.associatePlayer(currentGame!.id, botPlayer)

        await round.createGameRounds(currentGame!.id)
        createGameSocket(io, (await getGameWithRoundsDatasetPlayers(currentGame!.id))!)
        socket.emit('matchStarts', currentGame!.id)
      } else {
        createGameMatchmaking(io, currentGame.id)
      }
      callback({
        player,
        gameId: currentGame.id,
      })
    })
  })
}

const numberOfPlayers = 2
const createGameMatchmaking = (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  gameId: number
) => {
  io.of(`/matchmaking/${gameId}`).on('connection', (socket) => {
    socket.on('iAmAlsoReady', async (gameId, username, password, callback) => {
      let currentGame = await getGameWithRoundsDatasetPlayers(gameId)
      if (currentGame === null) {
        throw new Error(`Game ${gameId} doesn't exist`)
      }
      const player = await checkAndAssociatePlayer(username, password, currentGame)
      currentGame = await getGameWithRoundsDatasetPlayers(gameId)
      if (currentGame!.game_players.length === numberOfPlayers) {
        console.log(`Game ${gameId} is starting!`)
        const currentGame = await getGameWithRoundsDatasetPlayers(gameId)
        if (currentGame === null) {
          throw new Error(`Game ${gameId} doesn't exist`)
        }
        if (currentGame.rounds.filter(({ started_at }) => !!started_at).length) {
          throw new Error(`Game ${gameId} already has rounds`)
        }

        await round.createGameRounds(currentGame!.id)
        createGameSocket(io, (await getGameWithRoundsDatasetPlayers(gameId))!)
        socket.broadcast.emit('matchStarts', currentGame!.id)
        socket.emit('matchStarts', currentGame!.id)
      } else {
        socket.broadcast.emit('playerJoined', player.username)
        socket.emit('playerJoined', player.username)
      }

      callback({
        player,
      })
    })
  })
}
