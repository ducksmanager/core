import type { Socket } from "socket.io";

import { prismaCoa } from "~prisma-clients";
import type {
  inducks_issuequotation,
  Prisma as PrismaCoa,
} from "~prisma-clients/client_coa";

const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export const getQuotations = async (
  filter: PrismaCoa.inducks_issuequotationWhereInput,
) =>
  Object.entries(
    await prismaCoa.inducks_issuequotation
      .findMany({
        where: filter,
      })
      .then((results) => results.groupBy("shortIssuecode")),
  ).reduce<Record<string, inducks_issuequotation>>(
    (acc, [shortIssuecode, quotation]) => ({
      ...acc,
      [shortIssuecode]: {
        ...acc[shortIssuecode],
        ...quotation,
        estimationMin:
          acc[shortIssuecode]?.estimationMin && quotation.estimationMin
            ? Math.min(
                acc[shortIssuecode].estimationMin,
                quotation.estimationMin,
              )
            : quotation.estimationMin,
        estimationMax:
          acc[shortIssuecode]?.estimationMax && quotation.estimationMax
            ? Math.max(
                acc[shortIssuecode].estimationMax,
                quotation.estimationMax,
              )
            : quotation.estimationMax,
      },
    }),
    {},
  );

export const getQuotationsByShortIssuecodes = async (
  shortIssuecodes: string[],
) =>
  getQuotations({
    shortIssuecode: {
      in: shortIssuecodes,
    },
    estimationMin: { not: { equals: null } },
  });

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on(
    "getQuotationsByShortIssuecodes",
    async (shortIssueCodes, callback) => {
      const codes = shortIssueCodes.filter((code) =>
        ISSUE_CODE_REGEX.test(code),
      );
      if (!codes.length) {
        callback({ error: "Bad request" });
      } else if (codes.length > 4) {
        callback({ error: "Too many requests" });
      } else {
        callback({
          quotations: await getQuotationsByShortIssuecodes(codes),
        });
      }
    },
  );
};
