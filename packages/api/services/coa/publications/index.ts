import { Socket } from "socket.io";

import { prismaCoa } from "~/prisma";

import Events from "../types";

export default (socket: Socket<Events>) => {
  socket.on("getPublicationListFromCountrycode", (countrycode, callback) =>
    getPublicationTitles({ startsWith: `${countrycode}/` }).then(callback)
  );
  socket.on(
    "getPublicationListFromPublicationcodeList",
    (publicationCodes, callback) =>
      getPublicationTitles(
        publicationCodes.length ? { in: publicationCodes } : {}
      ).then(callback)
  );
};

export const getPublicationTitles = async (filter: {
  [operator: string]: string | string[];
}): Promise<Record<string, string>> =>
  prismaCoa.inducks_publication
    .findMany({
      where: {
        publicationcode: filter,
      },
    })
    .then((results) =>
      results.reduce(
        (acc, value) => ({ ...acc, [value.publicationcode]: value.title }),
        {}
      )
    );
