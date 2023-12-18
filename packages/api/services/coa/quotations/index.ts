import { prismaCoa } from "~/prisma";

import { CoaSocket } from "../types";

const PUBLICATION_CODE_REGEX = /[a-z]+\/[-A-Z0-9]+/g;
const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export default (socket: CoaSocket) => {
  socket.on("getQuotationsByIssueCodes", async (issueCodes, callback) => {
    const codes = issueCodes.filter((code) => ISSUE_CODE_REGEX.test(code));
    if (!codes.length) {
      throw new Error("400");
    } else if (codes.length > 4) {
      throw new Error("429");
    } else {
      callback(
        await prismaCoa.inducks_issuequotation.findMany({
          where: {
            issuecode: {
              in: codes.map(([code]) => code.replaceAll(/ +/, " ")),
            },
            estimationMin: { not: { equals: null } },
          },
        }),
      );
    }
  });
  socket.on(
    "getQuotationsByPublicationCodes",
    async (publicationCodes, callback) => {
      const codes = publicationCodes.filter((code) =>
        PUBLICATION_CODE_REGEX.test(code),
      );
      if (!codes.length) {
        throw new Error("400");
      } else if (codes.length > 50) {
        throw new Error("429");
      } else {
        callback(
          await prismaCoa.inducks_issuequotation.findMany({
            where: {
              publicationcode: { in: codes.map(([code]) => code) },
              estimationMin: { not: { equals: null } },
            },
          }),
        );
      }
    },
  );
};
