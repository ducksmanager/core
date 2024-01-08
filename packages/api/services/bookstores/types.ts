import { SimpleBookstore } from "~dm-types/SimpleBookstore";
import { bookstoreComment } from "~prisma-clients/client_dm";

import { Errorable } from "../types";

export default abstract class {
  static namespaceEndpoint: string = "/bookstores";
  abstract getActiveBookstores: (callback: (value: SimpleBookstore[]) => void) => void;
  abstract createBookstoreComment: (
    data: SimpleBookstore,
    callback: (
      value: Errorable<
        bookstoreComment,
        "No bookstore ID or name was provided" | "No bookstore exists"
      >
    ) => void
  ) => void;
  abstract approveBookstoreComment: (
    id: number,
    callback: (data: Errorable<void, "Invalid bookstore comment ID">) => void
  ) => void;
}

