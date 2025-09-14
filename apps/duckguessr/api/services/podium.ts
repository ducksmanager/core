import { PrismaClient, type player } from "../prisma/client_duckguessr/client";
import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import namespaces from "./namespaces";

export type PodiumServices = NamespaceProxyTarget<
  Socket<typeof listenEvents>,
  Record<string, never>
>;

const prisma = new PrismaClient();

const listenEvents = () => ({
  getPodium: async () => prisma.$queryRaw<(player & { sumScore: number })[]>`
      SELECT player.*, sum(score + speed_bonus) AS sumScore
      FROM player
      INNER JOIN round_score ON player.id = round_score.player_id
      WHERE username NOT like 'bot_%' and username NOT LIKE 'user%'
      GROUP BY player.id
      HAVING sumScore > 0
      ORDER BY sumScore DESC
    `,
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.PODIUM, {
  listenEvents,
  middlewares: [],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
