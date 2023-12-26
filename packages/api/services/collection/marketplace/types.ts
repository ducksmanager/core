import { Errorable } from "~/services/types";
import { requestedIssue } from "~prisma-clients/client_dm";

export default interface WatchedAuthors {
  createRequests: (issueIds: number[], callback: (value: Errorable<void, 'The provided issue IDs were not all found' | 'Invalid issue ID list, NaN'>) => void) => void;
  deleteRequests: (issueId: number, callback: () => void) => void;
  getRequests: (as: "buyer" | "seller", callback: (data: requestedIssue[]) => void) => void;
}
