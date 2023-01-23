export type SaleState =
  | boolean
  | { transferTo: number }
  | { setAsideFor: number };

export type SingleCopyState = {
  condition: string;
  isToRead: boolean;
  isOnSale: SaleState;
  purchaseId: number | null;
};

export type CopyStateWithUndefined = {
  condition: string | null | undefined;
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
