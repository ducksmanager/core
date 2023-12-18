import { Socket } from "socket.io";

import Authors from "./authors/types";
import Countries from "./countries/types";
import IssueDetails from "./issue-details/types";
import Issues from "./issues/types";
import Publications from "./publications/types";
import Quotations from "./quotations/types";

export interface CoaServices
  extends Countries,
    Publications,
    Issues,
    IssueDetails,
    Authors,
    Quotations {}

export type CoaSocket = Socket<CoaServices>;
