import { inducks_issuequotation } from "~prisma-clients/client_coa";
import { Errorable } from "~services/types";

export default interface Quotations {
  getQuotationsByIssueCodes: (
    issueCodes: string[],
    callback: (
      value: Errorable<
        inducks_issuequotation[],
        "Bad request" | "Too many requests"
      >
    ) => void
  ) => void;
  getQuotationsByPublicationCodes: (
    publicationCodes: string[],
    callback: (
      value: Errorable<inducks_issuequotation[], "Bad request">
    ) => void
  ) => void;
}
