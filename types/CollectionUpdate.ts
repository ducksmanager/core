export interface CopyState {
  condition: string;
  isToRead: "do_not_change" | boolean;
  isOnSale: "do_not_change" | string | boolean;
  purchaseId: "do_not_change" | number | null;
}

export interface CopyStateMultiple {
  condition: string[];
  isToRead: ("do_not_change" | boolean)[];
  isOnSale: (string | boolean)[];
  purchaseId: ("do_not_change" | number | null)[];
}

export interface CollectionUpdate {
  publicationcode: string;
  issueIdsByIssuenumber: { [issuenumber: string]: number[] };
  condition: string | string[];
  isOnSale: string | boolean | null | (string | boolean | null)[];
  isToRead:
    | "do_not_change"
    | boolean
    | null
    | ("do_not_change" | boolean | null)[];
  purchaseId:
    | "do_not_change"
    | number
    | null
    | ("do_not_change" | number | null)[];
}
