export interface CollectionUpdate {
  publicationcode: string;
  issueNumbers: string[];
  condition: string | string[];
  isOnSale:
    | boolean
    | "do_not_change"
    | null
    | (boolean | null | "do_not_change")[];
  isToRead:
    | boolean
    | "do_not_change"
    | null
    | (boolean | null | "do_not_change")[];
  purchaseId: number | number[] | string[] | null;
}
