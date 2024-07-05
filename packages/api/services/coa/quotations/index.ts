import type { Socket } from "socket.io";

import { prismaCoa } from "~prisma-clients";

const PUBLICATION_CODE_REGEX = /[a-z]+\/[-A-Z0-9]+/g;
const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export const getQuotationsByIssueCodes = async (shortIssuecodes: string[]) =>
  prismaCoa.inducks_issuequotation.findMany({
    where: {
      shortIssuecode: {
        in: shortIssuecodes,
      },
      estimationMin: { not: { equals: null } },
    },
  });

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on("getQuotationsByIssueCodes", async (shortIssueCodes, callback) => {
    const codes = shortIssueCodes.filter((code) => ISSUE_CODE_REGEX.test(code));
    if (!codes.length) {
      callback({ error: "Bad request" });
    } else if (codes.length > 4) {
      callback({ error: "Too many requests" });
    } else {
      callback({
        quotations: await getQuotationsByIssueCodes(codes),
      });
    }
  });
  socket.on(
    "getQuotationsByPublicationCodes",
    async (publicationCodes, callback) => {
      const codes = publicationCodes.filter((code) =>
        PUBLICATION_CODE_REGEX.test(code),
      );
      if (!codes.length) {
        callback({ error: "Bad request" });
      } else {
        callback({
          quotations: await prismaCoa.inducks_issuequotation.findMany({
            where: {
              publicationcode: { in: codes.map(([code]) => code) },
              estimationMin: { not: { equals: null } },
            },
          }),
        });
      }
    },
  );
};
