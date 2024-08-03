import type { Namespace, Server } from "socket.io";

import type { BookcaseEdge, BookcaseEdgeSprite } from "~dm-types/BookcaseEdge";
import { prismaClient as prismaDm } from "~prisma-clients/schemas/dm/client";

import { RequiredAuthMiddleware } from "../auth/util";
import options, { authenticated as authenticatedOptions } from "./options";
import order, { authenticated as authenticatedOrder } from "./order";
import type Events from "./types";
import { namespaceEndpoint } from "./types";
import { checkValidBookcaseUser } from "./util";

type BookcaseEdgeRaw = Omit<BookcaseEdge, "sprites"> & {
  sprites?: string;
};

export default (io: Server) => {
  const namespace = io.of(namespaceEndpoint) as Namespace<Events>;
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
          (await prismaDm.$queryRaw`
            SELECT issue.ID AS id,
              issue.issuecode,
              edge.ID AS edgeId,
              edge.DateAjout AS creationDate,
              IF(edge.ID IS NULL, '', GROUP_CONCAT(
                IF(edgeSprite.Sprite_name IS NULL, '',
                  JSON_OBJECT('name', edgeSprite.Sprite_name, 'version', edgeSpriteUrl.Version, 'size', edgeSprite.Sprite_size))
                ORDER BY edgeSprite.Sprite_size ASC)) AS sprites
            FROM numeros issue
            LEFT JOIN tranches_pretes edge
              USING(issuecode)
            LEFT JOIN tranches_pretes_sprites edgeSprite
              ON edgeSprite.ID_Tranche = edge.ID
            LEFT JOIN tranches_pretes_sprites_urls edgeSpriteUrl
              USING(Sprite_name)
            WHERE ID_Utilisateur = ${user.id}
            GROUP BY ${groupBy}
          `) as BookcaseEdgeRaw[]
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
