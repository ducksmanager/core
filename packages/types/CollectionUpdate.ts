import type { issue_condition } from "~prisma-clients/extended/dm.extends";

export type SaleState =
  | boolean
  | { transferTo: number }
  | { setAsideFor: number };

export type SingleCopyState = {
  id: number | null;
  condition: issue_condition;
  isToRead: boolean;
  isOnSale: SaleState;
  purchaseId: number | null;
};

export type CopyStateWithUndefined = {
  condition: issue_condition | null | undefined;
  isToRead: boolean | undefined;
  isOnSale: SaleState | undefined;
  purchaseId: number | null | undefined;
};

export type CollectionUpdateSingleIssue = {
  publicationcode: string;
  issuenumber: string;
  copies: SingleCopyState[];
};

export type CollectionUpdateMultipleIssues = {
  publicationcode: string;
  issuenumbers: string[];
} & CopyStateWithUndefined;
