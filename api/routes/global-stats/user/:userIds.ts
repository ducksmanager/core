import { Handler } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const userIds = req.params.userIds
    .split(",")
    .map((userId) => parseInt(userId))
    .filter((userId) => !isNaN(userId));
  let data = {};
  if (userIds.length) {
    data = {
      points: await getUsersPoints(userIds),
      stats: await getUsersQuickStats(userIds),
    };
  }
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
};

const getUsersQuickStats = async (userIds: number[]) =>
  (await prisma.$queryRaw`
      select u.ID                                        AS userId,
             u.username,
             u.TextePresentation                         as presentationSentence,
             u.AccepterPartage                           as shared,
             count(distinct Pays)                        AS numberOfCountries,
             count(distinct concat(Pays, '/', Magazine)) as numberOfPublications,
             count(Numero)                               as numberOfIssues
      from users u
               left join numeros on numeros.ID_Utilisateur = u.ID
      where u.ID IN (${Prisma.join(userIds)})
      group by u.ID`) as { [key: string]: number | boolean | string }[];

const getUsersPoints = async (userIds: number[]) =>
  (
    (await prisma.$queryRaw`
                select type_contribution.contribution,
                       ids_users.ID_User AS userId,
                       ifnull(contributions_utilisateur.points_total, 0) as totalPoints
                from (select 'Photographe' as contribution
                      union
                      select 'Createur' as contribution
                      union
                      select 'Duckhunter' as contribution) as type_contribution
                         join (SELECT ID AS ID_User
                               FROM users
                               WHERE ID IN (${Prisma.join(
                                 userIds
                               )})) AS ids_users
                         left join (SELECT uc.ID_User, uc.contribution, sum(points_new) as points_total
                                    FROM users_contributions uc
                                    GROUP BY uc.ID_User, uc.contribution) as contributions_utilisateur
                                   ON type_contribution.contribution = contributions_utilisateur.contribution
                                       AND ids_users.ID_User = contributions_utilisateur.ID_user`) as {
      contribution: string;
      userId: number;
      totalPoints: string;
    }[]
  ).map((value) => ({ ...value, totalPoints: parseInt(value.totalPoints) }));
