import type { AuthorDetails } from "~dm-types/AuthorDetails";
import type { SuggestionSorts, SuggestionsWithDetails } from "~dm-types/SuggestionsWithDetails";

export const namespaceEndpoint = "/stats";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getSuggestionsForCountry: (
    countrycode: string,
    sincePreviousVisit: "since_previous_visit" | "_",
    limit: number,
    callback: (value: Record<SuggestionSorts, SuggestionsWithDetails>) => void,
  ) => void;
  abstract getWatchedAuthorsStats: (
    callback: (value: AuthorDetails[]) => void,
  ) => void;
}
