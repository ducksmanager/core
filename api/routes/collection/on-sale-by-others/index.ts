import { Handler } from "express";

import { issue, PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) =>
  res.json(await getIssuesForSale(req.user.id));

export const getIssuesForSale: (
  buyerId: number
) => Promise<{ [publicationcode: string]: issue[] }> = async (
  buyerId: number
) => {
  const forSale = await prisma.$queryRaw<
    {
      id: number;
    }[]
  >`
      SELECT issue.ID AS id
      FROM numeros issue
      INNER JOIN (
        SELECT seller.ID
        FROM users seller
        INNER JOIN users_options uo on seller.ID = uo.ID_User
        WHERE uo.Option_nom = 'marketplace_contact_methods'
        LIMIT 1
      ) AS seller
          ON issue.ID_Utilisateur = seller.ID
      LEFT JOIN numeros_demandes requested_issue
          ON issue.ID = requested_issue.ID_Numero
      WHERE
        AV = 1
        AND ID_Utilisateur != ${buyerId}
        AND EXISTS(
          SELECT 1 FROM users_options uo
          WHERE uo.ID_User = ${buyerId}
            AND uo.Option_nom = 'sales_notification_publications'
            AND uo.Option_valeur IN (CONCAT(issue.Pays, '/', issue.Magazine),
                                     CONCAT(issue.Pays, '/', issue.Magazine, ' ', issue.Numero))
        )
        AND NOT EXISTS
          (SELECT 1
           FROM numeros user_collection
           WHERE user_collection.Pays = issue.Pays
             AND user_collection.Magazine = issue.Magazine
             AND user_collection.Numero = issue.Numero
             AND user_collection.ID_Utilisateur = ${buyerId}
          )`;

  return (
    (await prisma.issue.findMany({
      where: { id: { in: forSale.map(({ id }) => id) } },
    })) as issue[]
  ).reduce(
    (acc, issue) => ({
      ...acc,
      [`${issue.country}/${issue.magazine}`]: [
        ...(acc[`${issue.country}/${issue.magazine}`] || []),
        issue,
      ],
    }),
    {} as { [publicationcode: string]: issue[] }
  );
};
