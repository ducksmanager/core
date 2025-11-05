import type { issue_condition } from "~prisma-schemas/schemas/dm";

export type SaleState =
  | boolean
  | { transferTo: number }
  | { setAsideFor: number };

export type SingleCopyState = {
  id: number | null;
  condition: issue_condition | null;
  isToRead: boolean;
  isOnSale: SaleState;
  purchaseId: number | null;
  labelIds: number[];
};

export type CopyStateWithUndefined = {
  condition: issue_condition | null | undefined;
  isToRead: boolean | undefined;
  isOnSale: SaleState | undefined;
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
