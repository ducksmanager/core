import { prismaDm } from "~/prisma";
import { MedalPoints } from "~dm-types/MedalPoints";
import { SimpleUserWithQuickStats } from "~dm-types/SimpleUserWithQuickStats";
import { Prisma } from "~prisma-schemas/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { getMedalPoints } from "~routes/collection/points";

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
