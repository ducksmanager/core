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
    console.log('a user connected')
    socket.on('iAmReady', async (gameType, dataset, username, password) => {
      console.log(`${username} is ready`)
      const { gameId } = await game.createOrGetPending(gameType, dataset)
      const user = await game.associatePlayer(gameId, username, password)

      socket.emit('iAmReadyWithGameID', user, gameId)
    })
    socket.on('whoElseIsReady', (user, gameId) => {
      console.log(
        `${user.username} wants to know who else is in game ID ${gameId}`
      )
      socket.broadcast.emit('whoElseIsReady', user, gameId)
    })
    socket.on('iAmAlsoReady', async ({ username, password }, gameId) => {
      console.log(`${username} is also ready in game ID ${gameId}`)
      const user = await game.associatePlayer(gameId, username, password)

      socket.broadcast.emit('iAmAlsoReady', user, gameId)
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
