import { IssueSuggestion } from "./IssueSuggestion";

export class IssueSuggestionList {
  issues: { [shortIssueCode: string]: IssueSuggestion } = {};
  minScore = 0;
  maxScore = 0;
}
