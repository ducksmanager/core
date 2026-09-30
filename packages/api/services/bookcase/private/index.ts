import { useSocketEvents } from "socket-call-server";
import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../../index";
import { RequiredAuthMiddleware } from "../../auth/util";
import namespaces from "../../namespaces";

const listenEvents = ({ _socket }: UserServices) => ({
  setBookcaseOptions: ev(
    v.object({
      textures: v.object({
        bookcase: v.string(),
        bookshelf: v.string(),
      }),
      showAllCopies: v.boolean(),
    }),
  )(async ({ textures, showAllCopies: showDuplicatesInBookcase }) => {
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
  }),

  setBookcaseOrder: ev(v.array(v.string()))(async (publicationCodes) => {
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
  }),
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.BOOKCASE_PRIVATE, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
