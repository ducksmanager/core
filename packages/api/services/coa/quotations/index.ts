import type { Socket } from "socket.io";

import type {
  inducks_issuequotation, Prisma as PrismaCoa
} from "~prisma-clients/schemas/coa";
import {
  prismaClient as prismaCoa,
} from "~prisma-clients/schemas/coa";

const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export const getQuotations = async (
  filter: PrismaCoa.inducks_issuequotationWhereInput,
) =>
  Object.entries(
    await prismaCoa.inducks_issuequotation
      .findMany({
        where: filter,
      })
      .then((results) => results.groupBy("issuecode")),
  ).reduce<Record<string, inducks_issuequotation>>(
    (acc, [issuecode, quotation]) => ({
      ...acc,
      [issuecode]: {
        ...acc[issuecode],
        ...quotation,
        estimationMin:
          acc[issuecode]?.estimationMin && quotation.estimationMin
            ? Math.min(
              acc[issuecode].estimationMin,
              quotation.estimationMin,
            )
            : quotation.estimationMin,
        estimationMax:
          acc[issuecode]?.estimationMax && quotation.estimationMax
            ? Math.max(
              acc[issuecode].estimationMax,
              quotation.estimationMax,
            )
            : quotation.estimationMax,
      },
    }),
    {},
  );

export const getQuotationsByissuesByIssuecodes = async (
  issuecodes: string[],
) =>
  getQuotations({
    issuecode: {
      in: issuecodes,
    },
    estimationMin: { not: { equals: null } },
  });

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on(
    "getQuotationsByissuesByIssuecodes",
    async (issuesByIssuecodes, callback) => {
      const codes = issuesByIssuecodes.filter((code) =>
        ISSUE_CODE_REGEX.test(code),
      );
      if (!codes.length) {
        callback({ error: "Bad request" });
      } else if (codes.length > 4) {
        callback({ error: "Too many requests" });
      } else {
        callback({
          quotations: await getQuotationsByissuesByIssuecodes(codes),
        });
      }
    },
  );
};
