import type { Namespace, Server } from "socket.io";

import type { BookcaseContributor } from "~dm-types/BookcaseContributor";
import type { QuickStatsPerUser } from "~dm-types/QuickStatsPerUser";
import { Prisma } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { getMedalPoints } from "../collection/util";
import type Events from "./types";
import { namespaceEndpoint } from "./types";

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to global-stats");

    socket.on("getBookcaseContributors", (callback) =>
      prismaDm.$queryRaw<BookcaseContributor[]>`
      SELECT distinct users.ID AS userId, users.username AS name, '' AS text
      from users
             inner join users_contributions c on users.ID = c.ID_user
      where c.contribution IN ('photographe', 'createur')
      UNION
      SELECT '' as userId, Nom AS name, Texte AS text
      FROM bibliotheque_contributeurs
      ORDER BY name
    `.then(callback),
    );

    socket.on("getUserCount", (callback) =>
      prismaDm.user.count().then((data) => {
        callback(data);
      }),
    );

    socket.on("getUserList", (callback) =>
      prismaDm.user
        .findMany({
          select: {
            id: true,
            username: true,
          },
        })
        .then(callback),
    );

    socket.on("getUsersPointsAndStats", async (userIds: number[], callback) => {
      if (userIds.length) {
        const result = {
          points: await getMedalPoints(userIds),
          stats: await getUsersQuickStats(userIds),
        };
        callback(result);
      } else {
        callback({
          error: "Bad request",
          errorDetails: "Empty user IDs list",
        });
      }
    });

    socket.on("getUsersCollectionRarity", async (callback) => {
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
          userScores.find(({ userId }) => userId === socket.data.user?.id)
            ?.averageRarity || 0;

        callback({
          userScores,
          myScore,
        });
      }
    });
  });
};

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
        numberOfCountries: numberOfCountriesAndPublicationsPerUser[userId]?.numberOfCountries || 0,
        numberOfPublications: numberOfCountriesAndPublicationsPerUser[userId]?.numberOfPublications || 0,
        numberOfIssues: _count.id,
      };
      return acc;
    }, {});
  });
