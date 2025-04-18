import { useSocketEvents } from "socket-call-server";

import type { BookcaseContributor } from "~dm-types/BookcaseContributor";
import type { QuickStatsPerUser } from "~dm-types/QuickStatsPerUser";
import { Prisma } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { getMedalPoints } from "../collection/util";
import namespaces from "../namespaces";

const getUsersQuickStats = async (userIds: number[]) =>
  Promise.all([
    prismaDm.user.findMany({
      select: {
        id: true,
        username: true,
        presentationText: true,
        allowSharing: true,
        marketplaceAcceptsExchanges: true,
      },
      where: {
        id: {
          in: userIds,
        },
      },
    }),
    prismaDm.issue.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      where: {
        userId: {
          in: userIds,
        },
      },
    }),
    prismaDm.$queryRaw<
      {
        userId: number;
        numberOfCountries: number;
        numberOfPublications: number;
      }[]
    >`
    select issue.ID_Utilisateur                        AS userId,
           count(distinct Pays) AS numberOfCountries,
           count(distinct concat(Pays, '/', Magazine)) AS numberOfPublications
    from numeros AS issue
    where issue.ID_Utilisateur IN (${Prisma.join(userIds)})
    group by issue.ID_Utilisateur`,

    prismaDm.$queryRaw<{ userId: number; numberOfPublications: number }[]>`
    select issue.ID_Utilisateur                        AS userId,
           count(distinct concat(Pays, '/', Magazine)) AS numberOfPublications
    from numeros AS issue
    where issue.ID_Utilisateur IN (${Prisma.join(userIds)})
    group by issue.ID_Utilisateur`,
  ]).then(([users, counts, usersAndNumberOfCountriesAndPublications]) => {
    const usersById = users.groupBy("id");
    const numberOfCountriesAndPublicationsPerUser =
      usersAndNumberOfCountriesAndPublications.groupBy("userId");

    return counts.reduce<QuickStatsPerUser>((acc, { userId, _count }) => {
      acc[userId] = {
        ...usersById[userId],
        numberOfCountries:
          numberOfCountriesAndPublicationsPerUser[userId]?.numberOfCountries ||
          0,
        numberOfPublications:
          numberOfCountriesAndPublicationsPerUser[userId]
            ?.numberOfPublications || 0,
        numberOfIssues: _count.id,
      };
      return acc;
    }, {});
  });

const listenEvents = () => ({
  getBookcaseContributors: () =>
    prismaDm.$queryRaw<BookcaseContributor[]>`
    SELECT distinct users.ID AS userId, users.username AS name, '' AS text
    from users
           inner join users_contributions c on users.ID = c.ID_user
    where c.contribution IN ('photographe', 'createur')
    UNION
    SELECT '' as userId, Nom AS name, Texte AS text
    FROM bibliotheque_contributeurs
    ORDER BY name
  `,

  getUserCount: () => prismaDm.user.count(),

  getUserList: () =>
    prismaDm.user.findMany({
      select: {
        id: true,
        username: true,
      },
    }),

  getUsersPointsAndStats: async (userIds: number[]) => {
    if (userIds.length) {
      const result = {
        points: await getMedalPoints(userIds),
        stats: await getUsersQuickStats(userIds),
      };
      return result;
    } else {
      return {
        error: "Bad request",
        errorDetails: "Empty user IDs list",
      };
    }
  },
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.GLOBAL_STATS,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
