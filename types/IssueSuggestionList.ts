import { IssueSuggestion } from "./IssueSuggestion";

export class IssueSuggestionList {
  issues: { [key: string]: IssueSuggestion } = {};
  minScore = 0;
  maxScore = 0;
}
