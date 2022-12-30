import { Handler, Response } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_dm";
import { getMedalPoints } from "~routes/collection/points";
import PromiseReturnType = Prisma.PromiseReturnType;
import { SimpleUserWithQuickStats } from "~types/SimpleUserWithQuickStats";

const prisma = new PrismaClient();

export type getType = {
  points: PromiseReturnType<typeof getMedalPoints>;
  stats: PromiseReturnType<typeof getUsersQuickStats>;
};
export const get: Handler = async (req, res: Response<getType>) => {
  const userIds = req.params.userIds
    .split(",")
    .map((userId) => parseInt(userId))
    .filter((userId) => !isNaN(userId));
  if (userIds.length) {
    return res.json({
      points: await getMedalPoints(userIds),
      stats: await getUsersQuickStats(userIds),
    });
  }
  return res.end();
};

const getUsersQuickStats = async (userIds: number[]) =>
  (await prisma.$queryRaw`
    select u.ID                                        AS userId,
           u.username,
           u.TextePresentation                         as presentationText,
           u.AccepterPartage                           as allowSharing,
           count(distinct Pays)                        AS numberOfCountries,
           count(distinct concat(Pays, '/', Magazine)) as numberOfPublications,
           count(Numero)                               as numberOfIssues
    from users u
           left join numeros on numeros.ID_Utilisateur = u.ID
    where u.ID IN (${Prisma.join(userIds)})
    group by u.ID`) as SimpleUserWithQuickStats[];
