import type { AuthorDetails } from "~dm-types/AuthorDetails";
import type {
  SuggestionSorts,
  SuggestionsWithDetails,
} from "~dm-types/SuggestionsWithDetails";

export default { namespaceEndpoint: "/stats" }
;export type Events =  {


  getSuggestionsForCountry: (
    countrycode: string,
    sincePreviousVisit: "since_previous_visit" | "_",
    limit: number) => Record<SuggestionSorts, SuggestionsWithDetails>
  getWatchedAuthorsStats: (
    ) => AuthorDetails[]
}
