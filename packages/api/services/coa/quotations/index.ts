import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export const getShownQuotations = <
  Quotation extends Pick<
    inducks_issuequotation,
    "issuecode" | "estimationMin" | "estimationMax"
  >,
>(
  quotations: Quotation[],
) =>
  quotations
    .map((quotation) => ({
      ...quotation,
      estimationAverage:
        (quotation.estimationMax
          ? ((quotation.estimationMin || 0) + quotation.estimationMax) / 2
          : quotation.estimationMin) || 0,
    }))
    .groupBy("issuecode");

export const getQuotationsByIssuecodes = async (issuecodes: string[]) =>
  prismaCoa.inducks_issuequotation
    .findMany({
      where: {
        issuecode: {
          in: issuecodes,
        },
        estimationMin: { not: { equals: null } },
      },
    })
    .then(getShownQuotations);

export default {
  getQuotationsByIssuecodes: async (issuesByIssuecodes: string[]) => {
    const codes = issuesByIssuecodes.filter((code) =>
      ISSUE_CODE_REGEX.test(code),
    );
    if (!codes.length) {
      return Promise.resolve({ error: "Bad request" });
    } else if (codes.length > 4) {
      return Promise.resolve({ error: "Too many requests" });
    } else {
      return {
        quotations: await getQuotationsByIssuecodes(codes),
      };
    }
  },
};
