import { Server } from 'socket.io'
import Index, { PrismaClient } from '@prisma/client'
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

const prisma = new PrismaClient()

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

      socket.on('getStats', async (gameId, callback) => {
        let playerIdsToQuery: number[] = [player!.id]
        if (gameId) {
          playerIdsToQuery = [
            ...playerIdsToQuery,
            ...(
              await prisma.game_player.findMany({
                where: {
                  game_id: gameId,
                },
              })
            ).map(({ player_id }) => player_id),
          ]
        }
        // eslint-disable-next-line n/no-callback-literal
        callback(await getPlayerStatistics(playerIdsToQuery))
      })

      socket.on('getGameStats', async (gameId, callback) => {
        // eslint-disable-next-line n/no-callback-literal
        callback(await getPlayerGameStatistics(gameId))
      })
    } else {
      socket.emit('loginFailed')
    }
  })
}
