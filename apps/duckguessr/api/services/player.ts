import type { Socket } from "socket.io";
import { type NamespaceProxyTarget, useSocketEvents } from "socket-call-server";

import { getPlayer, getPlayerStatistics, updatePlayer } from "../get-player";
import prisma from "../prisma/client";
import { type player } from "../prisma/client_duckguessr/client";
import namespaces from "./namespaces";

export type ClientListenEvents = {
  logged: (player: player) => void;
};

export type PlayerServices = NamespaceProxyTarget<
  Socket<
    typeof listenEvents,
    ClientListenEvents,
    object,
    {
      user: player;
    }
  >,
  Record<string, never>
>;

const listenEvents = ({ _socket }: PlayerServices) => ({
  updateUser: async (updatedPlayer: player) =>
    updatePlayer(updatedPlayer.id, updatedPlayer),

  getStats: async (gameId?: number) => {
    const playerIdsToQuery = [_socket.data.user.id];
    if (gameId) {
      playerIdsToQuery.push(
        ...(
          await prisma.gamePlayer.findMany({
            where: {
              gameId,
            },
          })
        ).map(({ playerId }) => playerId),
      );
    }
    return await getPlayerStatistics(playerIdsToQuery);
  },

  getGameStats: async (gameId: number) => {
    const playerIdsToQuery = [_socket.data.user.id];
    if (gameId) {
      playerIdsToQuery.push(
        ...(
          await prisma.gamePlayer.findMany({
            where: {
              gameId,
            },
          })
        ).map(({ playerId }) => playerId),
      );
    }
    const stats = await getPlayerStatistics(playerIdsToQuery);
    return { gameId, stats };
  },
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.PLAYER, {
  listenEvents,
  middlewares: [
    ({ _socket }) => {
      getPlayer(_socket.handshake.auth.cookie).then((player) => {
        if (player) {
          _socket.data.user = player;
          _socket.emit("logged", player);
        }
      });
    },
  ],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
