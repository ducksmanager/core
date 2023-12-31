import { AuthorDetails } from "~dm-types/AuthorDetails";
import { SuggestionsWithDetails } from "~dm-types/SuggestionsWithDetails";

export interface Services {
  getSuggestionsForCountry: (
    countrycode: string,
    sincePreviousVisit: "since_previous_visit" | "_",
    sort: "score" | "oldestdate",
    limit: number,
    callback: (value: SuggestionsWithDetails) => void
  ) => void;
  getWatchedAuthorsStats: (callback: (value: AuthorDetails[]) => void) => void;
}

export const NamespaceEndpoint = "/stats";
