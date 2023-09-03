import { prismaDm } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";
import { BookcaseContributor } from "~types/BookcaseContributor";

export const get = async (
  ...[, res]: ExpressCall<{ resBody: BookcaseContributor[] }>
) =>
  res.json(
    await prismaDm.$queryRaw`
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
