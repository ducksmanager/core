import type { Socket } from "socket.io";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on("getAuthorList", async (personcodes, callback) =>
    getAuthorFullNames([...new Set(personcodes)]).then(callback),
  );

  socket.on("searchAuthor", async (partialAuthorName, callback) => {
    const authors = await prismaCoa.inducks_person.findMany({
      where: {
        fullname: {
          startsWith: partialAuthorName,
        },
      },
      take: 10,
    });

    callback(
      authors
        .map(({ personcode, fullname }) => ({
          personcode,
          fullname: fullname || personcode,
        }))
        .groupBy("personcode", "fullname"),
    );
  });
};

export const getAuthorFullNames = async (
  authorPersoncodes: string[],
): Promise<{ [personcode: string]: string }> =>
  (
    await prismaCoa.inducks_person.findMany({
      where: {
        personcode: {
          in: authorPersoncodes,
        },
      },
    })
  )
    .map(({ personcode, fullname }) => ({
      personcode,
      fullname: fullname || personcode,
    }))
    .groupBy("personcode", "fullname");
