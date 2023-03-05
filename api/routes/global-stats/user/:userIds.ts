import { Prisma, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { getMedalPoints } from "~routes/collection/points";
import { MedalPoints } from "~types/MedalPoints";
import { SimpleUserWithQuickStats } from "~types/SimpleUserWithQuickStats";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: {
      points: MedalPoints;
      stats: SimpleUserWithQuickStats[];
    };
    params: { userIds: string };
  }>
) => {
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
