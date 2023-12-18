import { Socket } from "socket.io";

import { AuthorDetails } from "~dm-types/AuthorDetails";
import { IssueSuggestion } from "~dm-types/IssueSuggestion";
import { User } from "~dm-types/SessionUser";
import { SuggestionList } from "~dm-types/SuggestionList";

type SuggestionsWithDetails = Omit<SuggestionList, "suggestionsPerUser"> & {
  issues: { [issuecode: string]: IssueSuggestion };
  minScore: number;
  maxScore: number;
};

export interface StatsServices {
  getSuggestionsForCountry: (
    countrycode: string,
    sincePreviousVisit: "since_previous_visit" | "_",
    sort: "score" | "oldestdate",
    limit: number,
    callback: (value: SuggestionsWithDetails) => void,
  ) => void;
  getWatchedAuthorsStats: (callback: (value: AuthorDetails[]) => void) => void;
}

export type StatsSocket = Socket<
  StatsServices,
  Record<string, never>,
  Record<string, never>,
  { user?: User }
>;
