import { Namespace, Server } from "socket.io";

import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { QuickStatsPerUser } from "~dm-types/QuickStatsPerUser";
import { Prisma } from "~prisma-clients/client_dm";
import prismaDm from "~prisma-clients/extended/dm.extends";

import { getMedalPoints } from "../collection/util";
import Services from "./types";

export default (io: Server) => {
  (io.of(Services.namespaceEndpoint) as Namespace<Services>)
    .on("connection", (socket) => {
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
    `.then(callback));

      socket.on("getUserCount", (callback) =>
        prismaDm.user.count().then((data => {
          callback(data)
        }))
      );

      socket.on("getUserList", (callback) =>
        prismaDm.user
          .findMany({
            select: {
              id: true,
              username: true,
            },
          })
          .then(callback)
      );

      socket.on(
        "getUsersPointsAndStats",
        async (userIds: number[], callback) => {
          console.log('!')
          if (userIds.length) {
            const result = {
              points: await getMedalPoints(userIds),
              stats: await getUsersQuickStats(userIds),
            };
            callback(result);
          } else {
            callback({ points: {}, stats: {} });
          }
        }
      );

      socket.on("getUsersCollectionRarity", async (callback) => {
        {
          const userCount = await prismaDm.user.count();
          const userScores = (await prismaDm.$queryRaw<{ userId: number; averageRarity: number }[]>`
            SELECT ID_Utilisateur AS userId, round(sum(rarity)) AS averageRarity
            FROM numeros
            LEFT JOIN
              (select issuecode, pow(${userCount} / count(*), 1.5) / 10000 as rarity
              from numeros n1
              group by issuecode) AS issues_rarity ON numeros.issuecode = issues_rarity.issuecode
            GROUP BY ID_Utilisateur
            ORDER BY averageRarity
        `);

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

const getUsersQuickStats = async (userIds: number[]) => Promise.all([
    prismaDm.user.findMany({
      select: {
        id: true,
        presentationText: true,
        allowSharing: true,
        marketplaceAcceptsExchanges: true
      }, where: {
        id: {
          in: userIds
        }
      }
    }), prismaDm.issue.groupBy({
      by: ['userId'],
      _count: {
        userId: true,
        country: true,
      },
      where: {
        userId: {
          in: userIds
        }
      }
    }),
    prismaDm.$queryRaw<{ userId: number, numberOfPublications: number }[]>`
    select issue.ID                                        AS userId,
           count(distinct concat(Pays, '/', Magazine)) as numberOfPublications
    from numeros AS issue
    where issue.ID_Utilisateur IN (${Prisma.join(userIds)})
    group by issue.ID`
  ]).then(([users, counts, usersAndNumberOfPublications]) => {
    const usersById = users.reduce<Record<string, typeof users[0]>>((acc, user) => ({ ...acc, [user.id]: user }), {});
    const numberOfPublicationsPerUser = usersAndNumberOfPublications.reduce<Record<number, number>>((acc, { userId, numberOfPublications }) => ({ ...acc, [userId]: numberOfPublications }), {})

    return counts.reduce<QuickStatsPerUser>((acc, { userId, _count }) => ({
      ...acc,
      [userId]: {
        ...usersById[userId],
        numberOfCountries: _count.country,
        numberOfIssues: _count.userId,
        numberOfPublications: numberOfPublicationsPerUser[userId] || 0
      }
    }), {})
  })
