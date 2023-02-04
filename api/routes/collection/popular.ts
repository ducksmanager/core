import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { PopularIssue } from "~types/PopularIssue";
import { SimplePopularity } from "~types/SimplePopularity";

const prisma = new PrismaClient();

export const get = async (...[req, res]: ExpressCall<SimplePopularity[]>) =>
  res.json(
    (await prisma.$queryRaw`
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
