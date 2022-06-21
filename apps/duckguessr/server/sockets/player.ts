import { Server } from 'socket.io'
import Index from '@prisma/client'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import {
  getPlayer,
  getPlayerGameStatistics,
  getPlayerStatistics,
  updatePlayer,
} from '../get-player'

export function createPlayerSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  io.of('/login').on('connection', async (socket) => {
    let player = await getPlayer(socket.handshake.auth.cookie)

    if (player) {
      socket.emit('logged', player)

      socket.on('updateUser', async (updatedPlayer: Index.player, callback: Function) => {
        player = await updatePlayer(player!.id, updatedPlayer)
        callback(player)
      })

      socket.on('getStats', async (callback) => {
        callback((await getPlayerStatistics(player!))[0])
      })

      socket.on('getGameStats', async (gameId, callback) => {
        callback((await getPlayerGameStatistics(player!, gameId))[0])
      })
    } else {
      socket.emit('loginFailed')
    }
  })
}
