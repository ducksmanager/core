import { InducksEntryDetails } from "~/types/InducksEntryDetails";

export interface InducksIssueDetails {
  entries: InducksEntryDetails[];
  releaseDate: string;
}
