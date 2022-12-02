import { IssueSuggestion } from "./IssueSuggestion";

export class IssueSuggestionList {
  issues: { [issuecode: string]: IssueSuggestion } = {};
  minScore = 0;
  maxScore = 0;
}
