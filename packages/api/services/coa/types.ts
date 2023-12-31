import Authors from "./authors/types";
import Countries from "./countries/types";
import IssueDetails from "./issue-details/types";
import Issues from "./issues/types";
import Publications from "./publications/types";
import Quotations from "./quotations/types";
import Stories from "./stories/types";

export interface Services
  extends Countries,
    Publications,
    Issues,
    IssueDetails,
    Authors,
    Quotations,
    Stories {}

export const NamespaceEndpoint = "/coa";
