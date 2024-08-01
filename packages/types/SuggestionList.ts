import type { IssueSuggestionList } from "./IssueSuggestionList";
import type { StoryDetail } from "./StoryDetail";

export interface SuggestionList {
  storyDetails?: { [storycode: string]: StoryDetail };
  suggestionsPerUser: { [userId: number]: IssueSuggestionList };
  publicationTitles: { [publicationcode: string]: string | null };
  authors: { [personcode: string]: string };
}
