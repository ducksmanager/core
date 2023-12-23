import { BookcaseEdge } from "~dm-types/BookcaseEdge";

import { Errorable, NamespaceGeneric, SocketGeneric } from "../types";
import Options from "./options/types";
import Order from "./order/types";

export interface Services extends Options, Order {
  getBookcase: (username: string, callback: (value: Errorable<{ edges: BookcaseEdge[] }>) => void) => void;
}

export interface Namespace extends NamespaceGeneric<Services> { }

export type Socket = SocketGeneric<Services>;
