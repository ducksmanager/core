import type { IssueSuggestionList } from "./IssueSuggestionList";
import type { StoryDetail } from "./StoryDetail";

export interface SuggestionList {
  storyDetails?: { [storycode: string]: StoryDetail };
  issueDetails?: { [issuecode: string]: { oldestdate: string } };
  suggestionsPerUser: { [userId: number]: IssueSuggestionList };
  authors: { [personcode: string]: string };
}
