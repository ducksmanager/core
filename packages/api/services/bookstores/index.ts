import type { Namespace, Server } from "socket.io";

import { prismaDm } from "~/prisma";
import type {
  bookstore,
  bookstoreComment,
  user} from "~prisma-clients/client_dm";
import {
  userContributionType,
} from "~prisma-clients/client_dm";

import Events from "./types";

export default (io: Server) => {
  (io.of(Events.namespaceEndpoint) as Namespace<Events>).on(
    "connection",
    (socket) => {
      socket.on("getActiveBookstores", (callback) =>
        prismaDm.bookstore
          .findMany({
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
            where: {
              comments: {
                some: {
                  isActive: true,
                },
              },
            },
          })
          .then(callback)
      );

      socket.on(
        "createBookstoreComment",
        async (
          {
            id,
            name,
            address,
            coordX,
            coordY,
            comments,
          },
          callback
        ) => {
          if (!id && !name) {
            callback({ error: "No bookstore ID or name was provided" });
            return;
          }
          let dbBookstore: bookstore;
          if (id) {
            try {
              dbBookstore = await prismaDm.bookstore.findUniqueOrThrow({
                where: { id },
              });
            } catch (e) {
              callback({
                error: "No bookstore exists",
                errorDetails: `ID: ${id}`,
              });
              return;
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

          callback(createdComment);
        }
      );

      socket.on("approveBookstoreComment", async (commentId, callback) => {
        let bookstoreComment: bookstoreComment;
        try {
          bookstoreComment = await prismaDm.bookstoreComment.findUniqueOrThrow({
            where: {
              id: commentId,
            },
          });
        } catch (e) {
          callback({
            error: "Invalid bookstore comment ID",
            errorDetails: `ID: ${commentId}`,
          });
          return;
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
      });
    }
  );
};

const persistContribution = async (
  user: user,
  newPoints: number,
  bookstoreComment: bookstoreComment
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
