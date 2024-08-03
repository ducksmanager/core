import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa";

export type InducksIssueQuotationSimple = Pick<
  inducks_issuequotation,
  "estimationMin" | "estimationMax" | "issuecode"
>;
