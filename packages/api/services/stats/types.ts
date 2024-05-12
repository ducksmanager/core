import type { AuthorDetails } from "~dm-types/AuthorDetails";
import type { SuggestionsWithDetails } from "~dm-types/SuggestionsWithDetails";

export default abstract class {
  static namespaceEndpoint = "/stats";

  abstract getSuggestionsForCountry: (
    countrycode: string,
    sincePreviousVisit: "since_previous_visit" | "_",
    sort: "score" | "oldestdate",
    limit: number,
    callback: (value: SuggestionsWithDetails) => void
  ) => void;
  abstract getWatchedAuthorsStats: (callback: (value: AuthorDetails[]) => void) => void;
}
