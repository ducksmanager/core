import type { Socket } from "socket.io";

import type {
  inducks_issuequotation,
} from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export const getShownQuotations = <Quotation extends Pick<inducks_issuequotation, 'issuecode'|'estimationMin'|'estimationMax'>> (quotations: Quotation[]) =>
  quotations.reduce<Record<string, Quotation & {estimationAverage: number}>>((acc, quotation) => {
    const issuecode = quotation.issuecode;
    let {estimationMin, estimationMax} = quotation;
    estimationMin||=0
    estimationMax||=0
    if (!acc[issuecode]) {
      acc[issuecode] = {...quotation, estimationAverage: 0, estimationMin: 0, estimationMax: 0};
    }

    acc[issuecode].estimationMin = Math.max(acc[issuecode].estimationMin!, estimationMin)
    acc[issuecode].estimationMax = Math.min(acc[issuecode].estimationMax!, estimationMax)

    acc[issuecode].estimationAverage =
    (acc[issuecode].estimationMax
      ? ((acc[issuecode].estimationMin || 0) +
          acc[issuecode].estimationMax!) /
        2
      : acc[issuecode].estimationMin) || 0;
    
    return acc;
  }, {});

export const getQuotationsByIssuecodes = async (issuecodes: string[]) =>
  prismaCoa.inducks_issuequotation.findMany({
    where: {
    issuecode: {
      in: issuecodes,
    },
    estimationMin: { not: { equals: null } }}
  }).then(getShownQuotations);

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
