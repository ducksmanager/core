import type { IssueSuggestion } from "./IssueSuggestion";

export class IssueSuggestionList {
  issues: { [issuesByIssuecode: string]: IssueSuggestion } = {};
  minScore = 0;
  maxScore = 0;
}
