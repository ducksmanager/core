
import type { BookcaseEdge } from "~dm-types/BookcaseEdge";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { RequiredAuthMiddleware } from "../auth/util";
import { checkValidBookcaseUser } from "./util";
import { useSocketServices } from "~socket.io-services";
import options from "./options";
import order from "./order";
import { Socket } from "socket.io";
import { SessionUser } from "~dm-types/SessionUser";

type BookcaseEdgeRaw = Omit<BookcaseEdge, "sprites"> & {
  spriteName: string;
  spriteVersion: string;
  spriteSize: number;
};


const getLastPublicationPosition = async (userId: number) =>
  (
    await prismaDm.bookcasePublicationOrder.aggregate({
      _max: { order: true },
      where: { userId },
    })
  )._max.order || -1;

const listenEvents = (socket: Socket<object, object, object, { user?: SessionUser }>) => ({
  getBookcaseOrder: async (username: string) => {
    const user = await checkValidBookcaseUser(socket.data.user, username);
    if (user.error) {
      return { error: user.error };
    } else {
      const userId = user.id;
      let maxSort = await getLastPublicationPosition(userId);
      const userSortedPublicationcodes = (
        await prismaDm.bookcasePublicationOrder.findMany({
          select: { publicationcode: true },
          where: { userId },
        })
      ).map(({ publicationcode }) => publicationcode);
      const userPublicationcodes = (
        await prismaDm.issue.findMany({
          select: {
            publicationcode: true,
          },
          distinct: ["publicationcode"],
          where: { userId },
          orderBy: [{ publicationcode: "asc" }],
        })
      ).map(({ publicationcode }) => publicationcode);

      const missingPublicationCodesInOrder = userPublicationcodes.filter(
        (publicationcode) =>
          !userSortedPublicationcodes.includes(publicationcode),
      );
      const obsoletePublicationCodesInOrder = userSortedPublicationcodes.filter(
        (publicationcode) => !userPublicationcodes.includes(publicationcode),
      );

      const insertOperations = missingPublicationCodesInOrder.map(
        (publicationcode) =>
          prismaDm.bookcasePublicationOrder.create({
            data: {
              publicationcode,
              order: ++maxSort,
              userId,
            },
          }),
      );
      await prismaDm.$transaction(insertOperations);

      const deleteOperations = obsoletePublicationCodesInOrder.map(
        (publicationcode) =>
          prismaDm.bookcasePublicationOrder.delete({
            where: { userId_publicationcode: { publicationcode, userId } },
          }),
      );
      await prismaDm.$transaction(deleteOperations);

      return {
        publicationCodes: (
          await prismaDm.bookcasePublicationOrder.findMany({
            select: { publicationcode: true },
            where: { userId },
            orderBy: { order: "asc" },
          })
        ).map(({ publicationcode }) => publicationcode),
      };
    }
  },
  getBookcase: async (username: string) => {
    const user = await checkValidBookcaseUser(null, username);
    if (user.error) {
      return { error: user.error };
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
        edges.groupBy(user.showDuplicatesInBookcase ? "id" : "issuecode", "[]"),
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
      .then((edges) => ({ edges }));
  },
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents
>("/bookcase", {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];

const authedListenEvents = () => ({
  ...options,
  ...order
})

export const {
  endpoint: authedEndpoint,
  client: authedClient,
  server: authedServer,
} = useSocketServices<typeof authedListenEvents>("/user-bookcase", {
  listenEvents: authedListenEvents,
  middlewares: [RequiredAuthMiddleware],
});
