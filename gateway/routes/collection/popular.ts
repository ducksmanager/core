import { Handler } from "express";

import { PrismaClient } from "../../prisma/generated/client_dm";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const popularities = (await prisma.$queryRaw`
      select issuePopularity.pays       AS country,
             issuePopularity.magazine   AS magazine,
             issuePopularity.numero     AS issueNumber,
             issuePopularity.popularite AS popularity
      from numeros_popularite issuePopularity
             inner join numeros issue
                        on issuePopularity.pays = issue.pays AND issuePopularity.magazine = issue.magazine AND
                           issuePopularity.numero = issue.numero
      where ID_Utilisateur = ${req.user.id}
      order by popularity DESC`) as {
    [key: string]: number | string;
  }[];
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(popularities));
};
