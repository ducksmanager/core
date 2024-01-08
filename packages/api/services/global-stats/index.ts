import { Namespace, Server } from "socket.io";

import { prismaDm } from "~/prisma";
import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { SimpleUserWithQuickStats } from "~dm-types/SimpleUserWithQuickStats";
import { Prisma } from "~prisma-clients/client_dm";

import { OptionalAuthMiddleware } from "../auth/util";
import { getMedalPoints } from "../collection/util";
import  Services from "./types";

export default (io: Server) => {
  (io.of(Services.namespaceEndpoint) as Namespace<Services>)
    .use(OptionalAuthMiddleware)
    .on("connection", (socket) => {
      socket.on("getBookcaseContributors", async (callback) =>
        prismaDm.$queryRaw`
      SELECT distinct users.ID AS userId, users.username AS name, '' AS text
      from dm.users
             inner join dm.users_contributions c on users.ID = c.ID_user
      where c.contribution IN ('photographe', 'createur')
      UNION
      SELECT '' as userId, Nom AS name, Texte AS text
      FROM dm.bibliotheque_contributeurs
      ORDER BY name
    `.then((data: unknown) => callback(data as BookcaseContributor[]))
      );

      socket.on("getUserCount", async (callback) =>
        prismaDm.user.count().then(callback)
      );

      socket.on("getUserList", async (callback) =>
        prismaDm.user
          .findMany({
            select: {
              id: true,
              username: true,
            },
          })
          .then((data) => callback(data))
      );

      socket.on(
        "getUsersPointsAndStats",
        async (userIds: number[], callback) => {
          if (userIds.length) {
            const result = {
              points: await getMedalPoints(userIds),
              stats: await getUsersQuickStats(userIds),
            };
            callback(result);
          } else {
            callback({ points: {}, stats: [] });
          }
        }
      );

      socket.on("getUsersCollectionRarity", async (callback) => {
        {
          const userCount = await prismaDm.user.count();
          const userScores = (await prismaDm.$queryRaw`
            SELECT ID_Utilisateur AS userId, round(sum(rarity)) AS averageRarity
            FROM numeros
            LEFT JOIN
              (select issuecode, pow(${userCount} / count(*), 1.5) / 10000 as rarity
              from numeros n1
              group by issuecode) AS issues_rarity ON numeros.issuecode = issues_rarity.issuecode
            GROUP BY ID_Utilisateur
            ORDER BY averageRarity
        `) as { userId: number; averageRarity: number }[];

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
  (await prismaDm.$queryRaw`
    select u.ID                                        AS userId,
           u.username,
           u.TextePresentation                         as presentationText,
           u.AccepterPartage                           as allowSharing,
           u.MarketplaceAccepteEchanges                as okForExchanges,
           count(distinct Pays)                        AS numberOfCountries,
           count(distinct concat(Pays, '/', Magazine)) as numberOfPublications,
           count(Numero)                               as numberOfIssues
    from users u
           left join numeros on numeros.ID_Utilisateur = u.ID
    where u.ID IN (${Prisma.join(userIds)})
    group by u.ID`) as SimpleUserWithQuickStats[];
