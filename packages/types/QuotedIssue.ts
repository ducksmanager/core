import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa/client/client";
import type { issue } from "~prisma-schemas/schemas/dm/client/client";

export type QuotedIssue = Pick<
  inducks_issuequotation,
  "issuecode" | "estimationMin" | "estimationMax"
> &
  Pick<issue, "condition"> & {
    estimationAverage: number;
    estimationGivenCondition: number;
  };
