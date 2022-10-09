import { Handler } from "express";

import { PrismaClient } from "~/dist/prisma/client_dm";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      await prisma.$queryRaw`
      SELECT distinct users.ID AS userId, users.username AS name, '' AS text
      from dm.users
               inner join dm.users_contributions c on users.ID = c.ID_user
      where c.contribution IN ('photographe', 'createur')
      UNION
      SELECT '' as userId, Nom AS name, Texte AS text
      FROM dm.bibliotheque_contributeurs
      ORDER BY name
  `
    )
  );
};
