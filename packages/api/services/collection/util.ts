import type { UserContributionTypeEn } from "~dm-types/UserContributionTypeEn";
import { Prisma } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

export const getMedalPoints = async (userIds: number[]) =>
  (
    await prismaDm.$queryRaw<
      {
        userContributionTypeEn: UserContributionTypeEn;
        userId: number;
        totalPoints: string;
      }[]
    >`
        select contributionType.contribution_external_name as userContributionTypeEn,
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
    `
  ).reduce<{ [userId: number]: Record<UserContributionTypeEn, number> }>(
    (acc, { userContributionTypeEn, totalPoints, userId }) => {
      acc[userId] = acc[userId] || {};
      acc[userId][userContributionTypeEn] = parseInt(totalPoints) || 0;
      return acc;
    },
    {},
  );
