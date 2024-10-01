import type { Socket } from "socket.io";

import type {
  inducks_issuequotation,
  Prisma as PrismaCoa,
} from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export const getQuotations = async (
  filter: PrismaCoa.inducks_issuequotationWhereInput,
) => {
  const results = await prismaCoa.inducks_issuequotation.findMany({
    where: filter,
  });

  return results.reduce<Record<string, inducks_issuequotation & {estimationAverage: number}>>((acc, quotation) => {
    const issuecode = quotation.issuecode;
    acc[issuecode] = {...quotation, estimationAverage: 0};
    acc[issuecode].estimationMin = Math.min(acc[issuecode].estimationMin ?? Infinity, quotation.estimationMin ?? Infinity);
    acc[issuecode].estimationMax = Math.max(acc[issuecode].estimationMax ?? -Infinity, quotation.estimationMax ?? -Infinity)

    acc[issuecode].estimationAverage =
    (acc[issuecode].estimationMax
      ? ((acc[issuecode].estimationMin || 0) +
          acc[issuecode].estimationMax!) /
        2
      : acc[issuecode].estimationMin) || 0;
    
    return acc;
  }, {});
}

export const getQuotationsByIssuecodes = async (issuecodes: string[]) =>
  getQuotations({
    issuecode: {
      in: issuecodes,
    },
    estimationMin: { not: { equals: null } },
  });

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on(
    "getQuotationsByIssuecodes",
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
          quotations: await getQuotationsByIssuecodes(codes),
        });
      }
    },
  );
};
