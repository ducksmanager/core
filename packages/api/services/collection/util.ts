import { prismaDm } from "~/prisma";
import { Prisma } from "~prisma-clients/client_dm";

export const getMedalPoints = async (userIds: number[]) =>
  (
    (await prismaDm.$queryRaw<{
      contribution: "edge_photographer" | "edge_designer" | "duckhunter";
      userId: number;
      totalPoints: string;
    }[]>`
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
    `)
  ).reduce(
    (acc, { contribution, totalPoints, userId }) => ({
      ...acc,
      [userId]: {
        ...(acc[userId] || {}),
        [contribution]: parseInt(totalPoints) || 0,
      },
    }),
    {} as {
      [userId: number]: Record<
        "edge_photographer" | "edge_designer" | "duckhunter",
        number
      >;
    }
  );
