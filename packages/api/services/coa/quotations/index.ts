import { Socket } from "socket.io";

import { prismaCoa } from "~/prisma";

import Services from "../types";
const PUBLICATION_CODE_REGEX = /[a-z]+\/[-A-Z0-9]+/g;
const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export default (socket: Socket<Services>) => {
  socket.on("getQuotationsByIssueCodes", async (issueCodes, callback) => {
    const codes = issueCodes.filter((code) => ISSUE_CODE_REGEX.test(code));
    if (!codes.length) {
      callback({ error: "Bad request" });
    } else if (codes.length > 4) {
      callback({ error: "Too many requests" });
    } else {
      callback({quotations:
        await prismaCoa.inducks_issuequotation.findMany({
          where: {
            issuecode: {
              in: codes.map(([code]) => code.replaceAll(/ +/, " ")),
            },
            estimationMin: { not: { equals: null } },
          },
        })}
      );
    }
  });
  socket.on(
    "getQuotationsByPublicationCodes",
    async (publicationCodes, callback) => {
      const codes = publicationCodes.filter((code) =>
        PUBLICATION_CODE_REGEX.test(code)
      );
      if (!codes.length) {
        callback({ error: "Bad request" });
      } else {
        callback({quotations:
          await prismaCoa.inducks_issuequotation.findMany({
            where: {
              publicationcode: { in: codes.map(([code]) => code) },
              estimationMin: { not: { equals: null } },
            },
          })}
        );
      }
    }
  );
};
