import { SimpleBookstore } from "~dm-types/SimpleBookstore";
import { bookstoreComment } from "~prisma-clients/client_dm";

import { Errorable, NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  getActiveBookstores: (callback: (value: SimpleBookstore[]) => void) => void;
  createBookstoreComment: (data: SimpleBookstore & { id?: string }, callback: (value: Errorable<bookstoreComment>) => void) => void;
  approveBookstoreComment: (id: number, callback: (data?: { error?: string }) => void) => void;
}

export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/bookstores';
}
export type Socket = SocketGeneric<Services>;
