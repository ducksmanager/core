import { inducks_issuequotation } from "~prisma-clients/client_coa";
import { issue } from "~prisma-clients/client_dm";

export type QuotedIssue = Pick<
  inducks_issuequotation,
  | "shortIssuecode"
  | "publicationcode"
  | "issuenumber"
  | "estimationMin"
  | "estimationMax"
> &
  Pick<issue, "condition"> & {
    estimation: number;
    estimationGivenCondition: number;
  };
