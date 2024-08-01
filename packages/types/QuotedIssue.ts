import type { inducks_issuequotation } from "~prisma-clients/schemas/coa";
import type { issue } from "~prisma-clients/schemas/dm";

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
