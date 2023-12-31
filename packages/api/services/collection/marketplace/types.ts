import { IssueWithPublicationcode } from "~dm-types/IssueWithPublicationcode";
import { requestedIssue } from "~prisma-clients/client_dm";
import { Errorable } from "~services/types";

import ContactMethods from "./contact-methods/types";

export default interface WatchedAuthors extends ContactMethods {
  createRequests: (
    issueIds: number[],
    callback: (
      value: Errorable<
        void,
        | "The provided issue IDs were not all found"
        | "Invalid issue ID list, NaN"
      >
    ) => void
  ) => void;
  deleteRequests: (issueId: number, callback: () => void) => void;
  getRequests: (
    as: "buyer" | "seller",
    callback: (data: requestedIssue[]) => void
  ) => void;

  getIssuesForSale: (
    callback: (data: Record<string, IssueWithPublicationcode[]>) => void
  ) => void;
}
