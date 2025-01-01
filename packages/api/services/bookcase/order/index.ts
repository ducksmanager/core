import type { Socket } from "socket.io";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { SessionUser } from "~dm-types/SessionUser";

export type UserSocket = Socket<object, object, object, { user: SessionUser }>;

export default (socket: UserSocket) => ({
  setBookcaseOptions: async ({
    textures,
    showAllCopies,
  }: {
    textures: { bookcase: string; bookshelf: string };
    showAllCopies: boolean;
  }) => {
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

    return "OK";
  },
});
