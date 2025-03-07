import { useSocketEvents } from "socket-call-server";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../index";
import { RequiredAuthMiddleware } from "../auth/util";
import namespaces from "../namespaces";

const userListenEvents = ({ _socket }: UserServices) => ({
  getUsersCollectionRarity: async () => {
    {
      const userCount = await prismaDm.user.count();
      const userScores = await prismaDm.$queryRaw<
        { userId: number; averageRarity: number }[]
      >`
            SELECT ID_Utilisateur AS userId, round(sum(rarity)) AS averageRarity
            FROM numeros
            LEFT JOIN
              (select issuecode, pow(${userCount} / count(*), 1.5) / 10000 as rarity
              from numeros n1
              group by issuecode) AS issues_rarity ON numeros.issuecode = issues_rarity.issuecode
            GROUP BY ID_Utilisateur
            ORDER BY averageRarity
        `;

      const myScore =
        userScores.find(({ userId }) => userId === _socket.data.user?.id)
          ?.averageRarity || 0;

      return {
        userScores,
        myScore,
      };
    }
  },
});

export const { client, server } = useSocketEvents<
  typeof userListenEvents,
  Record<string, never>
>(namespaces.GLOBAL_STATS_USER, {
  listenEvents: userListenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
