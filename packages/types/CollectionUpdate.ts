import type { issue_condition } from "~prisma-schemas/schemas/dm/client/client";

export type SingleCopyState = {
  id: number | null;
  condition: issue_condition | null;
  purchaseId: number | null;
  labelIds: number[];
};

export type CopyStateWithUndefined = {
  condition: issue_condition | null | undefined;
  purchaseId: number | null | undefined;
  labelIds: number[]|undefined;
};

export type CollectionUpdateSingleIssue = {
  issuecode: string;
  copies: SingleCopyState[];
};

export type CollectionUpdateMultipleIssues = {
  issuecodes: string[];
} & CopyStateWithUndefined;
