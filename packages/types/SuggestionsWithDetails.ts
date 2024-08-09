import type { IssueSuggestion } from "./IssueSuggestion";
import type { SuggestionList } from "./SuggestionList";

export type SuggestionsWithDetails = Omit<
  SuggestionList,
  "suggestionsPerUser"
> & {
  issues: { [issuesByIssuecode: string]: IssueSuggestion };
  minScore: number;
  maxScore: number;
};

export type SuggestionSorts = "score" | "oldestdate";
