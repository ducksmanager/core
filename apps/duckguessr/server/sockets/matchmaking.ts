import { Server } from 'socket.io'
import Index, { Prisma } from '@prisma/client'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { getGameWithRoundsDatasetPlayers } from '../game'
import { getBotUser, getPlayer } from '../get-player'
import { MatchDetails } from '../../types/matchDetails'

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
  io.of('/match').on('connection', async (socket) => {
    const user = await getPlayer(socket.handshake.auth.cookie)
    if (!user) {
      console.log(`Can't find user for cookie ${JSON.stringify(socket.handshake.auth.cookie)}`)
      return false
    }

    socket.on('createMatch', async (dataset, callback) => {
      console.log(`${user.username} is creating a match`)
      const newGame = await game.create(dataset)
      createGameMatchmaking(io, newGame.id)
      callback(newGame.id)
    })
  })
}

const createGameMatchmaking = (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  gameId: number
) => {
  io.of(`/matchmaking/${gameId}`).on('connection', async (socket) => {
    const user = await getPlayer(socket.handshake.auth.cookie)
    if (!user) {
      console.log(`Can't find user for cookie ${JSON.stringify(socket.handshake.auth.cookie)}`)
      return false
    }

    socket.on('addBot', async (gameId) => {
      const currentGame = await getGameWithRoundsDatasetPlayers(gameId)
      if (currentGame === null) {
        console.error(`Game ${gameId} doesn't exist`)
        return false
      }
      if (user.id !== currentGame!.game_players[0].player_id) {
        console.error('Only the player creating the match can add or remote a bot!')
        return false
      }

      const botUsername = `bot_${currentGame!.dataset.name}`
      await game.associatePlayer(gameId, await getBotUser(botUsername))

      socket.broadcast.emit('playerJoined', botUsername)
      socket.emit('playerJoined', botUsername)
    })

    socket.on('joinMatch', async (gameId, callback: Function) => {
      let currentGame = await getGameWithRoundsDatasetPlayers(gameId)
      if (currentGame === null) {
        console.error(`Game ${gameId} doesn't exist`)
        return false
      }
      const player = await checkAndAssociatePlayer(user, currentGame)
      currentGame = (await getGameWithRoundsDatasetPlayers(gameId))!

      socket.broadcast.emit('playerJoined', player.username)

      // eslint-disable-next-line n/no-callback-literal
      callback({
        isBotAvailable: currentGame.dataset.name === 'published-fr-recent',
        players: currentGame.game_players.map(({ player }) => player),
      } as MatchDetails)
    })

    socket.on('startMatch', async (gameId) => {
      const currentGame = await getGameWithRoundsDatasetPlayers(gameId)

      if (currentGame === null) {
        console.error(`Game ${gameId} doesn't exist`)
        return false
      }
      if (user.id !== currentGame!.game_players[0].player_id) {
        console.error('The player starting the match must be the one who created it!')
        return false
      }

      console.log(`Game ${gameId} is starting!`)
      await round.createGameRounds(currentGame!.id)
      createGameSocket(io, (await getGameWithRoundsDatasetPlayers(gameId))!)
      socket.broadcast.emit('matchStarts', currentGame!.id)
      socket.emit('matchStarts', currentGame!.id)
    })
  })
}
