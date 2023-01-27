import { Prisma, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { getMedalPoints } from "~routes/collection/points";
import { Call } from "~types/Call";
import { SimpleUserWithQuickStats } from "~types/SimpleUserWithQuickStats";
import PromiseReturnType = Prisma.PromiseReturnType;

const prisma = new PrismaClient();

export type getCall = Call<
  {
    points: PromiseReturnType<typeof getMedalPoints>;
    stats: PromiseReturnType<typeof getUsersQuickStats>;
  },
  { userIds: string }
>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
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
           u.MarketplaceAccepteEchanges                as okForExchanges,
           count(distinct Pays)                        AS numberOfCountries,
           count(distinct concat(Pays, '/', Magazine)) as numberOfPublications,
           count(Numero)                               as numberOfIssues
    from users u
           left join numeros on numeros.ID_Utilisateur = u.ID
    where u.ID IN (${Prisma.join(userIds)})
    group by u.ID`) as SimpleUserWithQuickStats[];
