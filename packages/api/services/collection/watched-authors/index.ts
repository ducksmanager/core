import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../../index";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

const maxWatchedAuthors = 5;

export default ({ _socket }: UserServices) => ({
  getWatchedAuthors: async () => {
    const authorsUsers = await prismaDm.authorUser.findMany({
      where: { userId: _socket.data.user.id },
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
      fullname: authorNames[au.personcode].fullname,
    }));
  },

  addWatchedAuthor: ev(v.string())(async (personcode) => {
    try {
      await upsertAuthorUser(personcode, _socket.data.user.id, null);
    } catch (e) {
      console.log(e);
      return { error: "Error", errorDetails: (e as Error).message };
    }
  }),

  updateWatchedAuthor: ev(
    v.object({
      personcode: v.string(),
      notation: v.nullable(v.number()),
    }),
  )(async (data) => {
    try {
      const { personcode, notation } = data;
      await upsertAuthorUser(personcode, _socket.data.user.id, notation);
    } catch (e) {
      console.error(e);
      return { error: "Error", errorDetails: (e as Error).message };
    }
  }),

  deleteWatchedAuthor: ev(v.string())(async (personcode) => {
    await prismaDm.authorUser.deleteMany({
      where: {
        personcode,
        userId: _socket.data.user.id,
      },
    });
  }),
});

const upsertAuthorUser = async (
  personcode: string,
  userId: number,
  notation: number | null,
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
        notation,
      },
    });
  }
};
