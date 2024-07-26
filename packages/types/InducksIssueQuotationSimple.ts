import { inducks_issuequotation } from "~prisma-clients/client_coa";

export type InducksIssueQuotationSimple = Pick<
  inducks_issuequotation,
  "estimationMin" | "estimationMax" | "publicationcode" | "shortIssuenumber"
>;
