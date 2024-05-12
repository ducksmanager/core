import type { Socket } from "socket.io";

import { prismaCoa } from "~/prisma";

import type Events from "../types";

export default (socket: Socket<Events>) => {
  socket.on("getPublicationListFromCountrycode", (countrycode, callback) =>
    getPublicationTitles({ startsWith: `${countrycode}/` }).then(callback),
  );
  socket.on("getFullPublicationList", (callback) =>
    getPublicationTitles().then(callback),
  );
  socket.on(
    "getPublicationListFromPublicationcodeList",
    (publicationCodes, callback) =>
      getPublicationTitles(
        publicationCodes.length ? { in: publicationCodes } : {},
      ).then(callback),
  );
};

export const getPublicationTitles = async (filter?: {
  [operator: string]: string | string[];
}): Promise<Record<string, string>> =>
  prismaCoa.inducks_publication
    .findMany({
      where: filter
        ? {
            publicationcode: filter,
          }
        : undefined,
    })
    .then((results) =>
      results.reduce(
        (acc, value) => ({ ...acc, [value.publicationcode]: value.title }),
        {},
      ),
    );
