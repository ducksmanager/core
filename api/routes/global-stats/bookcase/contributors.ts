import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[, res]: ExpressCall<{ userId: number | ""; name: string; text: string }[]>
) =>
  res.json(
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
  );
