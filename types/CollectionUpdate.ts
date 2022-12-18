import { issue_condition } from "~prisma_clients/client_dm";
export interface CopyState {
  condition: "do_not_change" | issue_condition | "missing";
  isToRead: "do_not_change" | boolean;
  isOnSale: "do_not_change" | string | boolean;
  purchaseId: "do_not_change" | number | null;
}

export interface CopyStateMultiple {
  condition: (issue_condition | "missing")[];
  isToRead: ("do_not_change" | boolean)[];
  isOnSale: (string | boolean)[];
  purchaseId: ("do_not_change" | number | null)[];
}

export interface CollectionUpdate {
  publicationcode: string;
  issueNumbers: string[];
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
