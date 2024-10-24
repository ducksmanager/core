import type { SimpleBookstore } from "~dm-types/SimpleBookstore";
import type { bookstoreComment } from "~prisma-schemas/schemas/dm";
import type { Errorable } from "~socket.io-services";

export const namespaceEndpoint = "/bookstores";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;
  abstract getBookstores: (
    callback: (value: SimpleBookstore[]) => void,
  ) => void;
  abstract getActiveBookstores: (
    callback: (value: SimpleBookstore[]) => void,
  ) => void;
  abstract createBookstoreComment: (
    data: SimpleBookstore,
    callback: (
      value: Errorable<
        bookstoreComment,
        "No bookstore ID or name was provided" | "No bookstore exists"
      >,
    ) => void,
  ) => void;
  abstract approveBookstoreComment: (
    id: number,
    callback: (data: Errorable<void, "Invalid bookstore comment ID">) => void,
  ) => void;
}
