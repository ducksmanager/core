import type { inducks_issuequotation } from "~prisma-clients/schemas/coa";

export type InducksIssueQuotationSimple = Pick<
  inducks_issuequotation,
  "estimationMin" | "estimationMax" | "issuecode"
>;
