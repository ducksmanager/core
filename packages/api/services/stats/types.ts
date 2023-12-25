
import { AuthorDetails } from "~dm-types/AuthorDetails";
import { IssueSuggestion } from "~dm-types/IssueSuggestion";
import { SuggestionList } from "~dm-types/SuggestionList";

import { NamespaceGeneric, SocketGeneric } from "../types";

type SuggestionsWithDetails = Omit<SuggestionList, "suggestionsPerUser"> & {
  issues: { [issuecode: string]: IssueSuggestion };
  minScore: number;
  maxScore: number;
};

export interface Services {
  getSuggestionsForCountry: (
    countrycode: string,
    sincePreviousVisit: "since_previous_visit" | "_",
    sort: "score" | "oldestdate",
    limit: number,
    callback: (value: SuggestionsWithDetails) => void,
  ) => void;
  getWatchedAuthorsStats: (callback: (value: AuthorDetails[]) => void) => void;
}

export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/stats';
}

export type Socket = SocketGeneric<Services>; 