import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/;

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
  getQuotationsByIssuecodes: ev(
    v.pipe(
      v.array(v.string()),
      v.transform((issuecodes) =>
        issuecodes.filter((code) => ISSUE_CODE_REGEX.test(code)),
      ),
      v.nonEmpty("Bad request" as const),
      v.maxLength(4, "Too many requests" as const),
    ),
  )(async (codes) => ({
    quotations: await getQuotationsByIssuecodes(codes),
  })),
};
