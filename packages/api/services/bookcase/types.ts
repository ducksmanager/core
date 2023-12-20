import { BookcaseEdge } from "../../../types/BookcaseEdge";
import {  NamespaceGeneric, SocketGeneric } from "../types";
import Options from "./options/types";
import Order from "./order/types";

export interface Services extends Options, Order {
  getBookcase: (username: string, callback: (value: {edges: BookcaseEdge[], error?:string}) => void) => void;
}

export interface Namespace extends NamespaceGeneric<Services> {}

export type Socket = SocketGeneric<Services>;
