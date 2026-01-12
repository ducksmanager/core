import { useSocketEvents } from "socket-call-server";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm";

import type { UserServices } from "../../../index";
import { RequiredAuthMiddleware } from "../../auth/util";
import namespaces from "../../namespaces";

const listenEvents = ({ _socket }: UserServices) => ({
  setBookcaseOptions: async ({
    textures,
    showAllCopies: showDuplicatesInBookcase,
  }: {
    textures: { bookcase: string; bookshelf: string };
    showAllCopies: boolean;
  }) => {
    const [, bookcaseSubTexture1] = textures.bookcase.split("/");
    const [, bookcaseSubTexture2] = textures.bookshelf.split("/");
    const user = await prismaDm.user.findUnique({
      where: {
        id: _socket.data.user.id,
      },
    });

    if (!user) {
      return "User does not exist";
    }

    await prismaDm.user.update({
      data: {
        ...user,
        bookcaseSubTexture1,
        bookcaseSubTexture2,
        showDuplicatesInBookcase,
      },
      where: { id: user.id },
    });
    return "OK";
  },
  setBookcaseOrder: async (publicationCodes: string[]) => {
    const userId = _socket.data.user.id;
    await prismaDm.bookcasePublicationOrder.deleteMany({
      where: { userId },
    });
    await prismaDm.bookcasePublicationOrder.createMany({
      data: publicationCodes.map((publicationcode, index) => ({
        publicationcode,
        order: index + 1,
        userId,
      })),
    });
  },
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.BOOKCASE_PRIVATE, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
