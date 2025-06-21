import type { IssueSuggestionList } from "./IssueSuggestionList";
import type { StoryDetail } from "./StoryDetail";

export interface SuggestionList {
  storyDetails?: { [storycode: string]: StoryDetail };
  suggestionsPerUser: { [userId: number]: IssueSuggestionList };
  authors: { [personcode: string]: string };
}
