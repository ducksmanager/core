import { prismaDm } from "~/prisma";
import { PopularIssue } from "~dm-types/PopularIssue";
import { SimplePopularity } from "~dm-types/SimplePopularity";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: SimplePopularity[] }>
) =>
  res.json(
    (await prismaDm.$queryRaw`
      select issuePopularity.pays       AS country,
             issuePopularity.magazine   AS magazine,
             issuePopularity.numero     AS issuenumber,
             issuePopularity.popularite AS popularity
      from numeros_popularite issuePopularity
             inner join numeros issue
                        on issuePopularity.pays = issue.pays AND issuePopularity.magazine = issue.magazine AND
                           issuePopularity.numero = issue.numero
      where ID_Utilisateur = ${req.user!.id}
      order by popularity DESC`) as PopularIssue[]
  );
