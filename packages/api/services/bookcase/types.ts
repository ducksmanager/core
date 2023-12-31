import { BookcaseEdge } from "~dm-types/BookcaseEdge";

import { Errorable } from "../types";
import Options from "./options/types";
import Order from "./order/types";

export interface Services extends Options, Order {
  getBookcase: (
    username: string,
    callback: (
      value: Errorable<
        { edges: BookcaseEdge[] },
        "Unauthorized" | "Forbidden" | "Not found"
      >
    ) => void
  ) => void;
}

export const NamespaceEndpoint = "/bookcase";
