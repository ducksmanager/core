import type { Socket } from "socket.io";

import { prismaDm } from "~/prisma";

import type Events from "../types";
const maxWatchedAuthors = 5;

export default (socket: Socket<Events>) => {
  socket.on("getWatchedAuthors", (callback) =>
    prismaDm.authorUser
      .findMany({
        where: { userId: socket.data.user!.id },
      })
      .then(callback),
  );

  socket.on("addWatchedAuthor", async (personcode, callback) => {
    try {
      await upsertAuthorUser(personcode, socket.data.user!.id);
      callback();
    } catch (e) {
      console.log(e);
      callback({ error: "Error", errorDetails: (e as Error).message });
    }
  });

  socket.on("updateWatchedAuthor", async (data, callback) => {
    try {
      const { personcode, notation } = data;
      await upsertAuthorUser(personcode, socket.data.user!.id, notation);
      callback();
    } catch (e) {
      console.error(e);
      callback({ error: "Error", errorDetails: (e as Error).message });
    }
  });

  socket.on("deleteWatchedAuthor", async (personcode, callback) => {
    await prismaDm.authorUser.deleteMany({
      where: {
        personcode,
        userId: socket.data.user!.id,
      },
    });
    callback();
  });
};

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
