import { useSocketEvents } from "socket-call-server";

import type { NewBookstore, NewComment, SimpleBookstore } from "~dm-types/SimpleBookstore";
import type {
  bookstore,
  bookstoreComment,
  user,
} from "~prisma-schemas/schemas/dm";
import { userContributionType } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import BookstoreSuggested from "../../emails/bookstore-suggested";
import BookstoreReportedClosed from "../../emails/bookstore-reported-closed";
import type { UserServices } from "../../index";
import {
  OptionalAuthMiddleware,
  RequiredAuthMiddleware,
  UserIsAdminMiddleware,
} from "../auth/util";
import namespaces from "../namespaces";
import { isAllowedToCreateBookstoreComment } from "./util";


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

const getBookstores = (onlyActive?: true): Promise<(bookstore & { comments: bookstoreComment[] })[]> =>
  prismaDm.bookstore.findMany({
    include: onlyActive ? { comments: {
        where: {
          isActive: true,
        },
      }
    } : {
      comments: true,
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

const adminListenEvents = () => ({
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
    if (bookstoreComment.userId) {
      const user = await prismaDm.user.findUniqueOrThrow({
        where: {
          id: bookstoreComment.userId,
        },
      });
      await persistContribution(user, 1, bookstoreComment);
    }
  },
});

export const { client: adminClient, server: adminServer } = useSocketEvents<
  typeof adminListenEvents,
  Record<string, never>
>(namespaces.BOOKSTORES_ADMIN, {
  listenEvents: adminListenEvents,
  middlewares: [RequiredAuthMiddleware, UserIsAdminMiddleware],
});

const listenEvents = ({ _socket }: UserServices) => ({
  getActiveBookstores: () => getBookstores(true),

  reportBookstoreAsClosed: async (bookstoreId: number) => {
    const bookstore = await prismaDm.bookstore.findUniqueOrThrow({
      where: { id: bookstoreId },
    });
    await new BookstoreReportedClosed({
      username: _socket.data.user?.username || "Anonymous",
      bookstoreId,
      bookstoreName: bookstore.name,
    }).send();
  },

  createBookstoreComment: async (bookstore: NewBookstore|SimpleBookstore, comment: NewComment) => {
    if (!bookstore.name || (('id' in bookstore) && !bookstore.id)) {
      return { error: "No bookstore ID or name was provided" };
    }
    const user = _socket.data.user
      ? await prismaDm.user.findUnique({
          where: {
            id: _socket.data.user.id,
          },
        })
      : null;

    let dbBookstore: bookstore & { comments: bookstoreComment[] };
    if ('id' in bookstore) {
      try {
        dbBookstore = await prismaDm.bookstore.findUniqueOrThrow({
          include: {
            comments: true,
          },
          where: { id: bookstore.id },
        });
        if (user && !isAllowedToCreateBookstoreComment(user.id, dbBookstore)) {
          return {
            error: "You are not allowed to create a comment on this bookstore",
          };
        }
      } catch (_e) {
        return {
          error: "No bookstore exists",
          errorDetails: `ID: ${bookstore.id}`,
        };
      }
    } else {
      const { name, address, coordX, coordY } = bookstore;
      dbBookstore = await prismaDm.bookstore.create({
        include: {
          comments: true,
        },
        data: {
          name,
          address,
          coordX,
          coordY,
        },
      });
    }
    const createdComment = await prismaDm.bookstoreComment.create({
      data: {
        bookstoreId: dbBookstore.id,
        isActive: false,
        userId: user?.id,
        ...comment,
      },
    });

    await new BookstoreSuggested({
      user,
    }).send();

    return createdComment;
  },
});

export type AdminClientEvents = (typeof adminClient)["emitEvents"];

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.BOOKSTORES, {
  listenEvents,
  middlewares: [OptionalAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
