import type { BookcaseEdge } from "~dm-types/BookcaseEdge";
import type { SessionUser } from "~dm-types/SessionUser";
import type { user } from "~prisma-schemas/client_dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import type { Errorable } from "~socket.io-services";
import { useSocketServices } from "~socket.io-services";

import type { UserSocket } from "../../index";
import { RequiredAuthMiddleware } from "../auth/util";
import namespaces from "../namespaces";
import options from "./options";

type BookcaseEdgeRaw = Omit<BookcaseEdge, "sprites"> & {
  spriteName: string;
  spriteVersion: string;
  spriteSize: number;
};

const checkValidBookcaseUser = async (
  user?: SessionUser | null,
  username?: string,
): Promise<Errorable<user, "Unauthorized" | "Forbidden" | "Not found">> => {
  try {
    const dbUser = await prismaDm.user.findFirstOrThrow({
      where: { username },
    });
    if (user?.id === dbUser.id || dbUser.allowSharing) {
      return dbUser;
    } else if (!user) {
      return { error: "Unauthorized" };
    } else return { error: "Forbidden" };
  } catch (_e) {
    return { error: "Not found" };
  }
};

const getLastPublicationPosition = async (userId: number) =>
  prismaDm.bookcasePublicationOrder
    .aggregate({
      _max: { order: true },
      where: { userId },
    })
    .then((results) => results._max.order || -1);

const listenEvents = (socket: UserSocket<true>) => ({
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

    return prismaDm.$queryRaw<BookcaseEdgeRaw[]>`
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
      .then<BookcaseEdge[]>(Object.values)
      .then((edges) => ({ edges }));
  },

  getBookcaseOptions: async (username: string) => {
    const user = await checkValidBookcaseUser(null, username);
    return user.error
      ? { error: user.error }
      : {
          textures: {
            bookcase: `${user.bookcaseTexture1}/${user.bookcaseSubTexture1}`,
            bookshelf: `${user.bookcaseTexture2}/${user.bookcaseSubTexture2}`,
          },
          showAllCopies: user.showDuplicatesInBookcase,
        };
  },
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { user?: SessionUser }
>(namespaces.BOOKCASE, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];

const authedListenEvents = (socket: UserSocket) => ({
  ...options(socket),
});

export const {
  endpoint: authedEndpoint,
  client: authedClient,
  server: authedServer,
} = useSocketServices<
  typeof authedListenEvents,
  object,
  object,
  { user: SessionUser }
>(namespaces.BOOKCASE_USER, {
  listenEvents: authedListenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type AuthedClientEvents = (typeof authedClient)["emitEvents"];
