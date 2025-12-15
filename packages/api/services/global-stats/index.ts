import { useSocketEvents } from "socket-call-server";
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
    select
      issue.ID_Utilisateur                        AS userId,
      count(distinct substring_index(issuecode, '/', 1)) AS numberOfCountries,
      count(distinct substring_index(issuecode, ' ', 1)) AS numberOfPublications
    from numeros AS issue
    where issue.ID_Utilisateur IN (${Prisma.join(userIds)})
    group by issue.ID_Utilisateur`,

    prismaDm.$queryRaw<{ userId: number; numberOfPublications: number }[]>`
    select issue.ID_Utilisateur                               AS userId,
           count(distinct substring_index(issuecode, ' ', 1)) AS numberOfPublications
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
    Promise.all([
      prismaDm.user.findMany({
        select: {
          id: true,
          username: true,
        },
        where: {
          userContributions: {
            some: {
              contribution: {
                in: ["photographe", "createur"],
              },
            },
          },
        },
      }),
      prismaDm.bookcaseExternalContributor.findMany({
        omit: {
          id: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]).then(([users, externalContributors]) =>
      [...users, ...externalContributors]
        .map((user) => ({
          ...user,
          name: "name" in user ? user.name : user.username,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    ),

  getUserCount: () => prismaDm.user.count(),

  getUserList: () =>
    prismaDm.user.findMany({
      select: {
        id: true,
        username: true,
      },
    }),

  getUsersPointsAndStats: async (userIds: number[]) =>
    userIds.length ? {
      points: await getMedalPoints(userIds),
      stats: await getUsersQuickStats(userIds),
    } : {
      error: "Bad request",
      errorDetails: "Empty user IDs list",
    },
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.GLOBAL_STATS,
  {
    listenEvents,
    middlewares: [],
  }
);

export type ClientEvents = (typeof client)["emitEvents"];
