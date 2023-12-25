import { BookcaseEdge } from "~dm-types/BookcaseEdge";

import { Errorable, NamespaceGeneric, SocketGeneric } from "../types";
import Options from "./options/types";
import Order from "./order/types";

export interface Services extends Options, Order {
  getBookcase: (username: string, callback: (value: Errorable<{ edges: BookcaseEdge[] }>) => void) => void;
}

export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/bookcase';
}

export type Socket = SocketGeneric<Services>;
