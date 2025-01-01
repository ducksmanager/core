import { UserSocket } from "~/index";
import { authorUser } from "~prisma-schemas/client_dm";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

const maxWatchedAuthors = 5;

export default (socket: UserSocket) => ({
  getWatchedAuthors: async () => {
    const authorsUsers = await prismaDm.authorUser.findMany({
      where: { userId: socket.data.user!.id },
    });
    const authorNames = (
      await prismaCoa.inducks_person.findMany({
        where: {
          personcode: {
            in: authorsUsers.map((au) => au.personcode),
          },
        },
      })
    ).groupBy("personcode");

    return authorsUsers.map((au) => ({
      ...au,
      fullname: authorNames[au.personcode]!.fullname,
    }));
  },

  addWatchedAuthor: async (personcode: string) => {
    try {
      await upsertAuthorUser(personcode, socket.data.user!.id);
    } catch (e) {
      console.log(e);
      return { error: "Error", errorDetails: (e as Error).message };
    }
  },

  updateWatchedAuthor: async (data: authorUser) => {
    try {
      const { personcode, notation } = data;
      await upsertAuthorUser(personcode, socket.data.user!.id, notation);
    } catch (e) {
      console.error(e);
      return { error: "Error", errorDetails: (e as Error).message };
    }
  },

  deleteWatchedAuthor: async (personcode: string) => {
    await prismaDm.authorUser.deleteMany({
      where: {
        personcode,
        userId: socket.data.user!.id,
      },
    });
  },
});

const upsertAuthorUser = async (
  personcode: string,
  userId: number,
  notation?: number,
) => {
  const criteria = {
    personcode,
    userId,
  };
  const existingAuthorUser = await prismaDm.authorUser.findFirst({
    where: criteria,
  });
  if (existingAuthorUser) {
    await prismaDm.authorUser.update({
      data: { notation },
      where: { id: existingAuthorUser?.id },
    });
  } else {
    if (
      (await prismaDm.authorUser.count({
        where: { userId },
      })) >= maxWatchedAuthors
    ) {
      throw new Error("429");
    }
    await prismaDm.authorUser.create({
      data: {
        ...criteria,
        notation: 5,
      },
    });
  }
};
