import { Handler } from "express";

import { getMedalPoints } from "~/routes/collection/points";
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
      points: await getMedalPoints(userIds),
      stats: await getUsersQuickStats(userIds),
    };
  }
  return res.json(data);
};

const simpleUserValidator = Prisma.validator<Prisma.userArgs>()({
  select: {
    id: true,
    username: true,
    presentationText: true,
    allowSharing: true,
  },
});

type SimpleUserWithQuickStats = Prisma.userGetPayload<
  typeof simpleUserValidator
> & {
  numberOfCountries: number;
  numberOfPublications: number;
  numberOfIssues: number;
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
