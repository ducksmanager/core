import { Server } from 'socket.io'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { getGameWithRoundsAndDataset } from '../game'

const game = require('../game')
const round = require('../round')
const { createGameSocket } = require('./game')

export function createMatchmakingSocket(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  io.of('/matchmaking').on('connection', (socket) => {
    console.log('a player is creating a match')
    socket.on(
      'iAmReady',
      async (gameType, dataset, username, password, callback) => {
        const { gameId } = await game.createOrGetPending(gameType, dataset)
        const user = await game.associatePlayer(gameId, username, password)
        console.log(`${username} is ready in game ${gameId}`)

        createGameMatchmaking(io, gameId)

        callback(null, {
          user,
          gameId,
        })
      }
    )
  })
}

const createGameMatchmaking = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  gameId: number
) => {
  io.of(`/matchmaking/${gameId}`).on('connection', (socket) => {
    socket.on('iAmAlsoReady', async (gameId, username, password, callback) => {
      const currentGame = await getGameWithRoundsAndDataset(gameId)
      if (currentGame === null) {
        throw new Error(`Game ${gameId} doesn't exist`)
      }
      const user = await game.associatePlayer(gameId, username, password)
      console.log(`${username} is ready in game ${gameId}`)

      socket.broadcast.emit('playerJoined', username)

      callback(null, {
        user,
        gameId,
      })
    })
    socket.on('matchStarts', async (gameId) => {
      console.log(`Game ${gameId} is starting!`)
      const currentGame = await getGameWithRoundsAndDataset(gameId)
      if (currentGame === null) {
        throw new Error(`Game ${gameId} doesn't exist`)
      }
      if (currentGame.rounds.filter(({ started_at }) => !!started_at).length) {
        throw new Error(`Game ${gameId} already has rounds`)
      }

      await round.createGameRounds(currentGame!.id)

      const currentGameWithRounds = await getGameWithRoundsAndDataset(gameId)
      createGameSocket(io, currentGameWithRounds!)
    })
  })
}
