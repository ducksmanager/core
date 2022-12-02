import { Handler } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();
export const getMedalPoints = async (userIds: number[]) => {
  return (
    (await prisma.$queryRaw`
        select contributionType.contribution_external_name as contribution,
               userIds.userId,
               ifnull(userContributions.totalPoints, 0)    as totalPoints
        from (select 'Photographe' as contribution, 'edge_photographer' as contribution_external_name
              union
              select 'Createur' as contribution, 'edge_designer' as contribution_external_name
              union
              select 'Duckhunter' as contribution, 'duckhunter' as contribution_external_name) as contributionType
                 join (SELECT ID AS userId
                       FROM users
                       WHERE ID IN (${Prisma.join(userIds)})) AS userIds
                 left join (SELECT uc.ID_User AS userId, uc.contribution, sum(points_new) as totalPoints
                            FROM users_contributions uc
                            GROUP BY userId, uc.contribution) as userContributions
                           ON contributionType.contribution = userContributions.contribution
                               AND userIds.userId = userContributions.userId
    `) as {
      contribution: string;
      userId: number;
      totalPoints: string;
    }[]
  ).reduce(
    (acc, { contribution, totalPoints, userId }) => ({
      ...acc,
      [userId]: {
        ...(acc[userId] || {}),
        [contribution]: parseInt(totalPoints) || 0,
      },
    }),
    {} as { [userId: number]: { [contribution: string]: number } }
  );
};

export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(await getMedalPoints([req.user.id])));
};
