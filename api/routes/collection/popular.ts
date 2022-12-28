import { Handler, Response } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";
import { PopularIssue } from "~types/PopularIssue";

const prisma = new PrismaClient();

type simplePopularity = {
  country: string;
  magazine: string;
  issuenumber: string;
  popularity: number;
};

export type getType = simplePopularity[];
export const get: Handler = async (req, res: Response<getType>) => {
  const popularities = (await prisma.$queryRaw`
      select issuePopularity.pays       AS country,
             issuePopularity.magazine   AS magazine,
             issuePopularity.numero     AS issuenumber,
             issuePopularity.popularite AS popularity
      from numeros_popularite issuePopularity
             inner join numeros issue
                        on issuePopularity.pays = issue.pays AND issuePopularity.magazine = issue.magazine AND
                           issuePopularity.numero = issue.numero
      where ID_Utilisateur = ${req.user.id}
      order by popularity DESC`) as PopularIssue[];
  return res.json(popularities);
};
