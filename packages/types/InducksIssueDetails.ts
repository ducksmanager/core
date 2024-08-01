import type { InducksEntryDetails } from "./InducksEntryDetails";

export interface InducksIssueDetails {
  entries: InducksEntryDetails[];
  releaseDate?: string;
}
