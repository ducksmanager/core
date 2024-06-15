import { IssueSuggestion } from "./IssueSuggestion";
import { SuggestionList } from "./SuggestionList";

export type SuggestionsWithDetails = Omit<
  SuggestionList,
  "suggestionsPerUser"
> & {
  issues: { [issuecode: string]: IssueSuggestion };
  minScore: number;
  maxScore: number;
};

export type SuggestionSorts = "score" | "oldestdate";
