import type { SimpleBookstore } from "~dm-types/SimpleBookstore";
import type { bookstoreComment } from "~prisma-schemas/schemas/dm";
import type { Errorable } from "~socket.io-services";

export default { namespaceEndpoint: "/bookstores" }
;export type Events =  {

  getBookstores: (
    ) => SimpleBookstore[]
  getActiveBookstores: (
    ) => SimpleBookstore[]
  createBookstoreComment: (
    data: SimpleBookstore) => Errorable<
        bookstoreComment,
        "No bookstore ID or name was provided" | "No bookstore exists"
      >,
    
  approveBookstoreComment: (
    id: number) => Errorable<void, "Invalid bookstore comment ID">
}
