import { NamespaceGeneric, SocketGeneric } from "../types";
import Authors from "./authors/types";
import Countries from "./countries/types";
import IssueDetails from "./issue-details/types";
import Issues from "./issues/types";
import Publications from "./publications/types";
import Quotations from "./quotations/types";

export interface Services
  extends Countries,
    Publications,
    Issues,
    IssueDetails,
    Authors,
    Quotations {}

export interface Namespace extends NamespaceGeneric<Services> {}

export type Socket = SocketGeneric<Services>;
