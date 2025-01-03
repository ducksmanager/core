import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserSocket } from "../../../index";

export default (socket: UserSocket) => ({
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
        id: socket.data.user!.id,
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
});
