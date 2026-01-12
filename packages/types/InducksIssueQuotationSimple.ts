import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa/client/client";

export type InducksIssueQuotationSimple = Pick<
  inducks_issuequotation,
  "estimationMin" | "estimationMax" | "issuecode"
>;
