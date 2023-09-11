import { prismaDm } from "~/prisma";
import { BookcaseEdge, BookcaseEdgeSprite } from "~dm-types/BookcaseEdge";
import { User } from "~dm-types/SessionUser";
import { user } from "~prisma-clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

type BookcaseEdgeRaw = Omit<BookcaseEdge, "sprites"> & {
  sprites?: string;
};

const mapEdges = (bookcaseEdge: BookcaseEdgeRaw): BookcaseEdge => ({
  ...bookcaseEdge,
  sprites:
    (bookcaseEdge.sprites?.indexOf("{") === 0 &&
      (JSON.parse(`[${bookcaseEdge.sprites}]`) as BookcaseEdgeSprite[])) ||
    [],
});

export const checkValidBookcaseUser = async (
  user: User | null,
  username: string
): Promise<user> => {
  const dbUser = await prismaDm.user.findFirstOrThrow({
    where: { username },
  });
  if (user?.id === dbUser.id || dbUser.allowSharing) {
    return dbUser;
  } else if (!user) {
    throw new Error("401");
  } else throw new Error("403");
};

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: BookcaseEdge[];
    params: { username: string };
  }>
) => {
  let user: user;
  try {
    user = await checkValidBookcaseUser(req.user, req.params.username);
  } catch (e) {
    res.statusCode = parseInt(e as string) || 404;
    res.end();
    return;
  }
  const groupBy = user.showDuplicatesInBookcase
    ? "numeros.ID"
    : "numeros.issuecode";
  return res.json(
    (
      (await prismaDm.$queryRawUnsafe(`
            SELECT numeros.ID                                                AS id,
                   numeros.Pays                                              AS countryCode,
                   numeros.Magazine                                          AS magazineCode,
                   CONCAT(numeros.Pays,'/',numeros.Magazine)                 AS publicationcode,
                   numeros.Numero                                            AS issuenumber,
                   IFNULL(reference.NumeroReference, numeros.Numero_nospace) AS issuenumberReference,
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
        `)) as BookcaseEdgeRaw[]
    ).map(mapEdges)
  );
};
