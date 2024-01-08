import { Namespace, Server } from "socket.io";

import { prismaDm } from "~/prisma";
import { BookcaseEdge, BookcaseEdgeSprite } from "~dm-types/BookcaseEdge";

import { RequiredAuthMiddleware } from "../auth/util";
import options from "./options/index";
import { authenticated as authenticatedOptions } from "./options/index";
import order from "./order/index";
import { authenticated as authenticatedOrder } from "./order/index";
import Services from "./types";
import { checkValidBookcaseUser } from "./util";

export enum COUNTRY_CODE_OPTION {
  ALL = "ALL",
  countries_to_notify = "countries_to_notify",
}

type BookcaseEdgeRaw = Omit<BookcaseEdge, "sprites"> & {
  sprites?: string;
};

export default (io: Server) => {
  const namespace = io.of(Services.namespaceEndpoint) as Namespace<Services>;
  namespace.use(RequiredAuthMiddleware).on("connection", (socket) => {
    authenticatedOptions(socket);
    authenticatedOrder(socket);
  });
  namespace.on("connection", (socket) => {
    options(socket);
    order(socket);

    socket.on("getBookcase", async (username, callback) => {
      const user = await checkValidBookcaseUser(null, username);
      if (user.error) {
        callback({ error: user.error });
        return;
      }
      const groupBy = user.showDuplicatesInBookcase
        ? "numeros.ID"
        : "numeros.issuecode";
      callback({
        edges: (
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
        ).map(mapEdges),
      });
    });
  });
};

const mapEdges = (bookcaseEdge: BookcaseEdgeRaw): BookcaseEdge => ({
  ...bookcaseEdge,
  sprites:
    (bookcaseEdge.sprites?.indexOf("{") === 0 &&
      (JSON.parse(`[${bookcaseEdge.sprites}]`) as BookcaseEdgeSprite[])) ||
    [],
});
