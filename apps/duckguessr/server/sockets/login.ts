import { Server } from 'socket.io'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { getUser } from '../get-user'

export function createLoginSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  io.of('/login').on('connection', async (socket) => {
    const user = await getUser(socket.handshake.auth.cookie)

    socket.emit('logged', user)
  })
}
