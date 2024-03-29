import { prismaDm } from "~/prisma";
import { BookcaseContributor } from "~dm-types/BookcaseContributor";
import { ExpressCall } from "~routes/_express-call";

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
