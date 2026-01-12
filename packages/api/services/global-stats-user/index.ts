import { useSocketEvents } from "socket-call-server";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm";

import type { UserServices } from "../../index";
import { RequiredAuthMiddleware } from "../auth/util";
import namespaces from "../namespaces";

const userListenEvents = ({ _socket }: UserServices) => ({
  getUsersCollectionRarity: async () => {
    {
      const userCount = await prismaDm.user.count();
      const userScores = await prismaDm.$queryRaw<
        {
          userId: number;
          rarityScore: number;
          rarestIssuecode: string;
          rarestIssueNumberOfOwners: number;
        }[]
      >`
      WITH issues_rarity AS (SELECT issuecode,
                              count(*) AS number_of_owners,
                              IF(
                                      count(*) = 0, 0,
                                      pow(${userCount} / count(*), 1.5) / 10000
                              ) as rarity
                       FROM numeros
                       GROUP BY issuecode),
     user_issues AS (SELECT numeros.ID_Utilisateur,
                            numeros.issuecode,
                            issues_rarity.rarity,
                            issues_rarity.number_of_owners
                     FROM numeros
                              LEFT JOIN issues_rarity USING (issuecode))
    SELECT ID                    AS userId,
          round(sum(ui.rarity)) AS rarityScore,
          (SELECT ui2.issuecode
            FROM user_issues ui2
            WHERE ui2.ID_Utilisateur = ui.ID_Utilisateur
            ORDER BY ui2.rarity DESC, issuecode
            LIMIT 1)             AS rarestIssuecode,
          (SELECT number_of_owners
            FROM user_issues ui3
            WHERE ui3.ID_Utilisateur = ui.ID_Utilisateur
            ORDER BY ui3.rarity DESC, issuecode
            LIMIT 1)             AS rarestIssueNumberOfOwners
    FROM user_issues ui
            INNER JOIN users ON users.ID = ui.ID_Utilisateur
    GROUP BY ui.ID_Utilisateur, username
    ORDER BY rarityScore DESC`;

      const myRank =
        userScores.findIndex(({ userId }) => userId === _socket.data.user.id) ||
        0;

      return {
        me: {
          rank: myRank + 1,
          rarestIssue: {
            issuecode: userScores[myRank].rarestIssuecode,
            numberOfOwners: userScores[myRank].rarestIssueNumberOfOwners,
          },
        },
        aboveMe: {
          userId: userScores[myRank - 1]?.userId,
        },
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
