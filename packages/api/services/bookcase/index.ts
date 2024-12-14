import type { Namespace, Server } from "socket.io";

import type { BookcaseEdge } from "~dm-types/BookcaseEdge";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { RequiredAuthMiddleware } from "../auth/util";
import options, { authenticated as authenticatedOptions } from "./options";
import order, { authenticated as authenticatedOrder } from "./order";
import type Events from "./types";
import { namespaceEndpoint } from "./types";
import { checkValidBookcaseUser } from "./util";

type BookcaseEdgeRaw = Omit<BookcaseEdge, "sprites"> & {
  spriteName: string;
  spriteVersion: string;
  spriteSize: number;
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

      prismaDm.$queryRaw<BookcaseEdgeRaw[]>`
            SELECT issue.ID AS id,
              issue.issuecode,
              edge.ID AS edgeId,
              edge.DateAjout AS creationDate,
              edgeSprite.Sprite_name AS spriteName,
              edgeSpriteUrl.Version AS spriteVersion,
              edgeSprite.Sprite_size AS spriteSize
            FROM numeros issue
            LEFT JOIN tranches_pretes edge
              USING(issuecode)
            LEFT JOIN tranches_pretes_sprites edgeSprite
              ON edgeSprite.ID_Tranche = edge.ID
            LEFT JOIN tranches_pretes_sprites_urls edgeSpriteUrl
              USING(Sprite_name)
            WHERE ID_Utilisateur = ${user.id}
          `
        .then((edges) =>
          edges.groupBy(
            user.showDuplicatesInBookcase ? "id" : "issuecode",
            "[]",
          ),
        )
        .then(Object.entries)
        .then(
          (
            arr: [number | string, BookcaseEdgeRaw[]][],
          ): [number | string, BookcaseEdge][] =>
            arr.map(([key, edges]) => [
              key,
              {
                ...edges[0],
                sprites: edges
                  .map(({ spriteName, spriteSize, spriteVersion }) => ({
                    name: spriteName,
                    size: spriteSize,
                    version: spriteVersion,
                  }))
                  .filter(({ size }) => !!size),
              },
            ]),
        )
        .then(Object.values)
        .then((edges) => callback({ edges }));
    });
  });
};
