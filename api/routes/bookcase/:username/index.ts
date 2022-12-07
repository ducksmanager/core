import { Handler } from "express";
import { Request, Response } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export const checkValidBookcaseUser = async (req: Request, res: Response) => {
  const username = req.params.username;
  const user = await prisma.user.findFirst({
    where: { username },
  });
  if (!user) {
    res.writeHead(404);
    res.end();
  } else if (!req.user) {
    res.writeHead(401);
    res.end();
  } else if (user.id !== req.user.id && !user.allowSharing) {
    res.writeHead(403);
    res.end();
  } else {
    return user;
  }
  return null;
};

export const get: Handler = async (req, res) => {
  const user = await checkValidBookcaseUser(req, res);
  if (user !== null) {
    const groupBy = user.showDuplicatesInBookcase
      ? "numeros.ID"
      : "numeros.issuecode";
    return res.json(
      (await prisma.$queryRawUnsafe(`
            SELECT numeros.ID                                                AS id,
                   numeros.Pays                                              AS countryCode,
                   numeros.Magazine                                          AS magazineCode,
                   numeros.Numero                                            AS issueNumber,
                   IFNULL(reference.NumeroReference, numeros.Numero_nospace) AS issueNumberReference,
                   tp.ID                                                     AS edgeId,
                   tp.DateAjout                                              AS creationDate,
                   IF(tp.ID IS NULL, '', GROUP_CONCAT(
                           IF(sprites.Sprite_name is null, '',
                              JSON_OBJECT('name', sprites.Sprite_name, 'version', sprites.Version, 'size',
                                          sprites.Sprite_size))
                           ORDER BY sprites.Sprite_size ASC
                       ))                                                    AS sprites
            FROM numeros
                     LEFT JOIN tranches_doublons reference
                               ON numeros.Pays = reference.Pays
                                   AND numeros.Magazine = reference.Magazine
                                   AND numeros.Numero_nospace = reference.Numero
                     LEFT JOIN tranches_pretes tp
                               ON CONCAT(numeros.Pays, '/', numeros.Magazine) = tp.publicationcode
                                   AND IFNULL(reference.NumeroReference, numeros.Numero_nospace) = tp.issuenumber
                     LEFT JOIN (SELECT sprites.ID_Tranche, sprites.sprite_name, sprites.Sprite_size, sprite_urls.Version
                                FROM tranches_pretes_sprites sprites
                                         INNER JOIN tranches_pretes_sprites_urls sprite_urls
                                                    ON sprites.Sprite_name = sprite_urls.Sprite_name) AS sprites
                               ON sprites.ID_Tranche = tp.ID
            WHERE ID_Utilisateur = ${user.id}
            GROUP BY ${groupBy}
        `)) as { [field: string]: number | Date | string }[]
    );
  }
};
