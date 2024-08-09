import type { Socket } from "socket.io";

import type { Prisma as PrismaCoa } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import type Events from "../types";

export default (socket: Socket<Events>) => {
  socket.on("getPublicationListFromCountrycodes", (countrycodes, callback) =>
    getPublicationTitles({
      OR: countrycodes.map((countrycode) => ({
        publicationcode: { startsWith: `${countrycode}/` },
      })),
    }).then(callback),
  );
  socket.on("getFullPublicationList", (callback) =>
    getPublicationTitles().then(callback),
  );
  socket.on(
    "getPublicationListFromPublicationcodeList",
    (publicationCodes, callback) =>
      getPublicationTitles(
        publicationCodes.length
          ? { publicationcode: { in: publicationCodes } }
          : {},
      ).then(callback),
  );
};

export const getPublicationTitles = async (
  filter?: PrismaCoa.inducks_publicationWhereInput,
): Promise<Record<string, string>> =>
  prismaCoa.inducks_publication
    .findMany({
      where: filter,
    })
    .then((results) =>
      results.reduce(
        (acc, value) => ({ ...acc, [value.publicationcode]: value.title }),
        {},
      ),
    );
