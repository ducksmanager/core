import type { Server, Socket } from "socket.io";
import { type NamespaceProxyTarget, useSocketEvents } from "socket-call-server";

import {
  getPlayer,
  getPlayerGameStatistics,
  getPlayerStatistics,
  updatePlayer,
} from "../get-player";
import type { player } from "../prisma/client_duckguessr/client";
import { PrismaClient } from "../prisma/client_duckguessr/client";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socketEvents";
import namespaces from "./namespaces";

const prisma = new PrismaClient();

export type PlayerServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, SocketData>,
  Record<string, never>
>;

const listenEvents = ({ _socket }: PlayerServices) => ({
  updateUser: async (updatedPlayer: player) =>
    updatePlayer(updatedPlayer.id, updatedPlayer),

  getStats: async (
    _gameId: number,
  ): Promise<ReturnType<typeof getPlayerStatistics>> => {
    // TODO
    return [];
  },

  getGameStats: async (
    _gameId: number,
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
