import { useSocketEvents } from "socket-call-server";

import type { BookcaseEdge } from "~dm-types/BookcaseEdge";
import type { SessionUser } from "~dm-types/SessionUser";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../index";
import namespaces from "../namespaces";

type BookcaseEdgeRaw = Omit<BookcaseEdge, "sprites"> & {
  spriteName: string;
  spriteVersion: string;
  spriteSize: number;
};

const checkValidBookcaseUser = async (
  user?: SessionUser | null,
  username?: string,
) => {
  try {
    const dbUser = await prismaDm.user.findFirstOrThrow({
      where: { username },
    });
    if (user?.id === dbUser.id || dbUser.allowSharing) {
      return dbUser;
    } else if (!user) {
      return { error: "Unauthorized" } as const;
    } else return { error: "Forbidden" } as const;
  } catch (_e) {
    return { error: "Not found" } as const;
  }
};

const getLastPublicationPosition = async (userId: number) =>
  prismaDm.bookcasePublicationOrder
    .aggregate({
      _max: { order: true },
      where: { userId },
    })
    .then((results) => results._max.order || -1);

const listenEvents = ({ _socket }: UserServices<true>) => ({
  getBookcaseOrder: async (username: string) => {
    const user = await checkValidBookcaseUser(_socket.data.user, username);
    if ("error" in user) {
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
      const userIssuecodes = await prismaDm.issue.findMany({
        select: {
          issuecode: true,
        },
        distinct: ["issuecode"],
        where: { userId },
        orderBy: { issuecode: "asc" },
      });

      const augmentedIssuecodes =
        await prismaCoa.augmentIssueArrayWithInducksData(
          userIssuecodes.filter(
            (item): item is { issuecode: string } => !!item.issuecode,
          ),
        );

      const userPublicationcodes = [
        ...new Set(
          augmentedIssuecodes.map(({ publicationcode }) => publicationcode),
        ),
      ].filter(Boolean);

      const inducksPublications = (
        await prismaCoa.inducks_publication.findMany({
          select: {
            publicationcode: true,
          },
          where: {
            publicationcode: {
              in: userPublicationcodes,
            },
          },
        })
      ).map(({ publicationcode }) => publicationcode);

      const missingPublicationCodesInOrder = userPublicationcodes.filter(
        (publicationcode) =>
          inducksPublications.includes(publicationcode) &&
          !userSortedPublicationcodes.includes(publicationcode),
      );

      const obsoletePublicationCodesInOrder = userSortedPublicationcodes.filter(
        (publicationcode) =>
          !inducksPublications.includes(publicationcode) ||
          !userPublicationcodes.includes(publicationcode),
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
    if ("error" in user) {
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
        prismaCoa.augmentIssueArrayWithInducksData(
          edges.filter(({ issuecode }) => !!issuecode),
        ),
      )
      .then((edges) =>
        edges.groupBy(user.showDuplicatesInBookcase ? "id" : "issuecode", "[]"),
      )
      .then((obj) => Object.values(obj))
      .then((arr) =>
        arr.map((edges) => ({
          ...edges[0],
          sprites: edges
            .map(({ spriteName, spriteSize, spriteVersion }) => ({
              name: spriteName,
              size: spriteSize,
              version: spriteVersion,
            }))
            .filter(({ size }) => !!size),
        })),
      )
      .then((edges) => ({ edges }));
  },

  getBookcaseOptions: async (username: string) => {
    const user = await checkValidBookcaseUser(null, username);
    return "error" in user
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

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.BOOKCASE_USER, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
