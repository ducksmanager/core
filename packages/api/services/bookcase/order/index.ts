import { Socket } from "socket.io";

import prismaDm from "~prisma-clients/extended/dm.extends";

import Events from "../types";
import { checkValidBookcaseUser } from "../util";

export default (socket: Socket<Events>) => {
  socket.on("getBookcaseOrder", async (username, callback) => {
    const user = await checkValidBookcaseUser(socket.data.user, username);
    if (user.error) {
      callback({ error: user.error });
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
          distinct: ["country", "magazine"],
          where: { userId },
          orderBy: [{ country: "asc" }, { magazine: "asc" }],
        })
      ).map(({ publicationcode }) => publicationcode);

      const missingPublicationCodesInOrder = userPublicationcodes.filter(
        (publicationcode) =>
          !userSortedPublicationcodes.includes(publicationcode)
      );
      const obsoletePublicationCodesInOrder = userSortedPublicationcodes.filter(
        (publicationcode) => !userPublicationcodes.includes(publicationcode)
      );

      const insertOperations = missingPublicationCodesInOrder.map(
        (publicationcode) =>
          prismaDm.bookcasePublicationOrder.create({
            data: {
              publicationcode,
              order: ++maxSort,
              userId,
            },
          })
      );
      await prismaDm.$transaction(insertOperations);

      const deleteOperations = obsoletePublicationCodesInOrder.map(
        (publicationcode) =>
          prismaDm.bookcasePublicationOrder.delete({
            where: { userId_publicationcode: { publicationcode, userId } },
          })
      );
      await prismaDm.$transaction(deleteOperations);

      callback({
        publicationCodes: (
          await prismaDm.bookcasePublicationOrder.findMany({
            select: { publicationcode: true },
            where: { userId },
            orderBy: { order: "asc" },
          })
        ).map(({ publicationcode }) => publicationcode),
      });
    }
  });
};

export const authenticated = (socket: Socket) => {
  socket.on(
    "setBookcaseOptions",
    async ({ textures, showAllCopies }, callback) => {
      const [, bookcaseTexture] = textures.bookcase.split("/");
      const [, bookshelfTexture] = textures.bookshelf.split("/");
      const user = await prismaDm.user.findUniqueOrThrow({
        where: {
          id: socket.data.user!.id,
        },
      });

      user.bookcaseSubTexture1 = bookcaseTexture;
      user.bookcaseSubTexture2 = bookshelfTexture;
      user.showDuplicatesInBookcase = showAllCopies;
      await prismaDm.user.update({
        data: user,
        where: { id: user.id },
      });

      callback("OK");
    }
  );
};

const getLastPublicationPosition = async (userId: number) =>
  (
    await prismaDm.bookcasePublicationOrder.aggregate({
      _max: { order: true },
      where: { userId },
    })
  )._max.order || -1;
