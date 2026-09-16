import type { Socket } from "socket.io";
import { type NamespaceProxyTarget, useSocketEvents } from "socket-call-server";

import { getPlayerStatistics, updatePlayer } from "../get-player";
import prisma from "../prisma/client";
import { type player } from "../prisma/client_duckguessr/browser";
import namespaces from "./namespaces";
import { RequiredPlayerMiddleware } from "../middlewares/required-player";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

export type ClientListenEvents = {
  logged: (player: player) => void;
  loginFailed: () => void;
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

const playerValidation = v.object({
  id: v.number(),
  username: v.string(),
  ducksmanagerId: v.nullable(v.number()),
  avatar: v.string(),
});

const listenEvents = ({ _socket }: PlayerServices) => ({
  getPlayer: () => Promise.resolve(_socket.data.user),

  updateUser: ev(playerValidation)(async (updatedPlayer) =>
    updatePlayer(updatedPlayer.id, updatedPlayer),
  ),

  getStats: ev(v.optional(v.number()))(async (gameId) => {
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
  }),

  getGameStats: ev(v.number())(async (gameId: number) => {
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
  }),
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.PLAYER, {
  listenEvents,
  middlewares: [RequiredPlayerMiddleware],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
