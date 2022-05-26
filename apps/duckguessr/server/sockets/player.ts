import { Server } from 'socket.io'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { getPlayer, getPlayerStatistics } from '../get-player'

export function createPlayerSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  io.of('/login').on('connection', async (socket) => {
    const player = await getPlayer(socket.handshake.auth.cookie)

    if (player) {
      socket.emit('logged', player)

      socket.on('getStats', async (gameId, callback) => {
        callback((await getPlayerStatistics(player, gameId))[0])
      })
    } else {
      socket.emit('loginFailed')
    }
  })
}
