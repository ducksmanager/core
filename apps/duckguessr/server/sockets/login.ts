import { Server } from 'socket.io'
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../types/socketEvents'
import { getUsername } from '../get-username'

export function createLoginSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
) {
  io.of('/login').on('connection', (socket) => {
    const username = getUsername(socket.handshake.auth.cookie)

    socket.emit('logged', username)
  })
}
