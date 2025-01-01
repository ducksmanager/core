import type {
  bookstore,
  bookstoreComment,
  user,
} from "~prisma-schemas/schemas/dm";
import { userContributionType } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { UserIsAdminMiddleware } from "../auth/util";
import { useSocketServices } from "~socket.io-services";
import { SessionUser } from "~dm-types/SessionUser";
import { UserSocket } from "~/index";
import { SimpleBookstore } from "~dm-types/SimpleBookstore";



const persistContribution = async (
  user: user,
  newPoints: number,
  bookstoreComment: bookstoreComment,
) => {
  const currentUserPoints = (
    await prismaDm.userContribution.aggregate({
      _sum: {
        newPoints: true,
      },
      where: {
        userId: user.id,
        contribution: userContributionType.duckhunter,
      },
    })
  )._sum.newPoints;

  await prismaDm.userContribution.create({
    data: {
      userId: user.id,
      contribution: userContributionType.duckhunter,
      date: new Date(),
      newPoints: newPoints,
      totalPoints: (currentUserPoints || 0) + newPoints,
      isEmailSent: false,
      bookstoreCommentId: bookstoreComment.id,
    },
  });
};

const getBookstores = async (onlyActive?: true) =>
  prismaDm.bookstore.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      coordX: true,
      coordY: true,
      comments: {
        where: {
          isActive: true,
        },
      },
    },
    where: onlyActive
      ? {
          comments: {
            some: {
              isActive: true,
            },
          },
        }
      : undefined,
  });

const adminListenEvents = (socket: UserSocket) => ({
  getBookstores: () => getBookstores(),
  approveBookstoreComment: async (commentId: number) => {
    let bookstoreComment: bookstoreComment;
    try {
      bookstoreComment = await prismaDm.bookstoreComment.findUniqueOrThrow({
        where: {
          id: commentId,
        },
      });
    } catch (_e) {
      return {
        error: "Invalid bookstore comment ID",
        errorDetails: `ID: ${commentId}`,
      };
    }
    await prismaDm.bookstoreComment.update({
      data: {
        isActive: true,
        creationDate: new Date(),
      },
      where: {
        id: bookstoreComment.id,
      },
    });
    const user = await prismaDm.user.findUniqueOrThrow({
      where: {
        id: socket.data.user!.id,
      },
    });
    await persistContribution(user, 1, bookstoreComment);
  },
});

export const {
  endpoint: adminEndpoint,
  client: adminClient,
  server: adminServer,
} = useSocketServices<
  typeof adminListenEvents,
  object,
  object,
  { user: SessionUser }
>("/bookcase", {
  listenEvents: adminListenEvents,
  middlewares: [UserIsAdminMiddleware],
});


const listenEvents = (socket: UserSocket) => ({
  getActiveBookstores: () => getBookstores(true),

  createBookstoreComment: async ({
    id,
    name,
    address,
    coordX,
    coordY,
    comments,
  }: SimpleBookstore) => {
    if (!id && !name) {
      return { error: "No bookstore ID or name was provided" };
    }
    let dbBookstore: bookstore;
    if (id) {
      try {
        dbBookstore = await prismaDm.bookstore.findUniqueOrThrow({
          where: { id },
        });
      } catch (_e) {
        return {
          error: "No bookstore exists",
          errorDetails: `ID: ${id}`,
        };
      }
    } else {
      dbBookstore = await prismaDm.bookstore.create({
        data: {
          name,
          address,
          coordX,
          coordY,
        },
      });
    }
    const user = socket.data.user
      ? await prismaDm.user.findUnique({
          where: {
            id: socket.data.user.id,
          },
        })
      : null;
    const createdComment = await prismaDm.bookstoreComment.create({
      data: {
        bookstoreId: dbBookstore.id,
        isActive: false,
        userId: user?.id,
        comment: comments[comments.length - 1].comment,
      },
    });

    return createdComment;
  },
});

export type AdminClientEvents = (typeof adminClient)["emitEvents"];

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { user: SessionUser }
>("/bookcase", {
  listenEvents,
  middlewares: [UserIsAdminMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];