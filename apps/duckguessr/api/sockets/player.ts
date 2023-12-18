import { Server } from "socket.io";

import {
  getPlayer,
  getPlayerGameStatistics,
  getPlayerStatistics,
  updatePlayer,
} from "../get-player";
import { PrismaClient } from "../prisma/client_duckguessr";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socketEvents";

const prisma = new PrismaClient();

export const createPlayerSocket = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) => {
  io.of("/login").on("connection", async (socket) => {
    let player = await getPlayer(socket.handshake.auth.cookie);

    if (player) {
      socket.emit("logged", player);

      socket.on("updateUser", async (updatedPlayer, callback) => {
        player = await updatePlayer(player!.id, updatedPlayer);
        callback(player);
      });

      socket.on("getStats", async (gameId, callback) => {
        let playerIdsToQuery: number[] = [player!.id];
        if (gameId) {
          playerIdsToQuery = [
            ...playerIdsToQuery,
            ...(
              await prisma.gamePlayer.findMany({
                where: {
                  gameId,
                },
              })
            ).map(({ playerId }) => playerId),
          ];
        }
        callback(await getPlayerStatistics(playerIdsToQuery));
      });

      socket.on("getGameStats", async (gameId, callback) => {
        callback(await getPlayerGameStatistics(gameId));
      });
    } else {
      socket.emit("loginFailed");
    }
  });
};
