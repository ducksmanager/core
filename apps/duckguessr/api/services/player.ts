import type { Server, Socket } from "socket.io";

import {
  getPlayer,
  getPlayerGameStatistics,
  getPlayerStatistics,
  updatePlayer,
} from "../get-player";
import namespaces from "./namespaces";
import type { player } from "../prisma/client_duckguessr";
import { PrismaClient } from "../prisma/client_duckguessr";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socketEvents";
import { useSocketEvents, type NamespaceProxyTarget } from "socket-call-server";

const prisma = new PrismaClient();

export type PlayerServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, SocketData>,
  Record<string, never>
>;

const listenEvents = ({ _socket }: PlayerServices) => ({
  updateUser: async (updatedPlayer: player) =>
    updatePlayer(updatedPlayer.id, updatedPlayer),

  getStats: async (
    gameId: number,
  ): Promise<ReturnType<typeof getPlayerStatistics>> => {
    // TODO
    return [];
  },

  getGameStats: async (
    gameId: number,
  ): Promise<ReturnType<typeof getPlayerGameStatistics>> => {
    // TODO
    return [];
  },
});
export const createPlayerSocket = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
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

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.PLAYER, {
  listenEvents,
  middlewares: [],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
