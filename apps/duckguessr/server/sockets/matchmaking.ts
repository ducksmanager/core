import { Server } from 'socket.io'
import Index, { Prisma } from '@prisma/client'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { getGameWithRoundsDatasetPlayers } from '../game'
import { getBotUser, getUser } from '../get-user'

const game = require('../game')
const round = require('../round')
const { createGameSocket } = require('./game')

const checkAndAssociatePlayer = async (
  player: Index.player,
  currentGame: Prisma.PromiseReturnType<typeof getGameWithRoundsDatasetPlayers>
) => {
  if (currentGame!.game_players.find(({ player_id }) => player_id === player.id)) {
    console.info(`Player ${player.username} is already associated with game ${currentGame!.id}`)
  } else {
    await game.associatePlayer(currentGame!.id, player)
    console.log(`${player.username} is ready in game ${currentGame!.id}`)
  }
  return player
}

export function createMatchmakingSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  io.of('/matchmaking').on('connection', async (socket) => {
    const user = await getUser(socket.handshake.auth.cookie)
    console.log(`${user.username} is creating a match`)

    socket.on('iAmReady', async (dataset, numberOfPlayers, addBot, callback) => {
      const user = await getUser(socket.handshake.auth.cookie)
      const currentGame = await game.create(dataset)
      await checkAndAssociatePlayer(user, currentGame)

      const botUsername = addBot ? `bot_${currentGame.dataset.name}` : null
      await createGameMatchmaking(io, currentGame.id, numberOfPlayers, botUsername)
      callback({
        gameId: currentGame.id,
      })
    })
  })
}

const createGameMatchmaking = async (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  gameId: number,
  numberOfPlayers: number,
  botUsername: string | null
) => {
  let botPlayer: Index.player
  if (botUsername) {
    botPlayer = await getBotUser(botUsername)
    await game.associatePlayer(gameId, botPlayer)
  }

  io.of(`/matchmaking/${gameId}`).on('connection', (socket) => {
    if (botUsername) {
      socket.broadcast.emit('playerJoined', botPlayer.username)
      socket.emit('playerJoined', botPlayer.username)
    }

    socket.on('iAmAlsoReady', async (gameId, callback) => {
      let currentGame = await getGameWithRoundsDatasetPlayers(gameId)
      if (currentGame === null) {
        throw new Error(`Game ${gameId} doesn't exist`)
      }
      const numberOfPlayersWithBots = numberOfPlayers + (botUsername ? 1 : 0)
      const user = await getUser(socket.handshake.auth.cookie)
      const player = await checkAndAssociatePlayer(user, currentGame)
      currentGame = await getGameWithRoundsDatasetPlayers(gameId)
      if (currentGame!.game_players.length === numberOfPlayersWithBots) {
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
        players: currentGame!.game_players.map(({ player }) => player),
      })
    })
  })
}
