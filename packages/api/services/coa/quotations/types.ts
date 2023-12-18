import { inducks_issuequotation } from "~prisma-clients/client_coa";

export default interface Quotations {
  getQuotationsByIssueCodes: (
    issueCodes: string[],
    callback: (value: inducks_issuequotation[]) => void,
  ) => void;
  getQuotationsByPublicationCodes: (
    publicationCodes: string[],
    callback: (value: inducks_issuequotation[]) => void,
  ) => void;
}
