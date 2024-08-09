import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa";
import type { issue } from "~prisma-schemas/schemas/dm";

export type QuotedIssue = Pick<
  inducks_issuequotation,
  | "issuecode"
  | "estimationMin"
  | "estimationMax"
> &
  Pick<issue, "condition"> & {
    estimation: number;
    estimationGivenCondition: number;
  };
