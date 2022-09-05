import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      await prisma.$queryRaw`
          SELECT Count(Numero) as numberOfIssues, CONCAT(Pays, '/', Magazine) AS publicationcode, Numero AS issuenumber
          FROM numeros
          WHERE NOT EXISTS(
                  SELECT 1
                  FROM tranches_pretes
                  WHERE CONCAT(numeros.Pays, '/', numeros.Magazine) = tranches_pretes.publicationcode
                    AND numeros.Numero_nospace = tranches_pretes.issuenumber
              )
          GROUP BY Pays, Magazine, Numero
          ORDER BY numberOfIssues DESC, Pays, Magazine, Numero
          LIMIT 20
      `,
      (key, value) => (typeof value === "bigint" ? Number(value) : value)
    )
  );
};
