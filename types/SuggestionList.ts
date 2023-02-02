import { IssueSuggestionList } from "./IssueSuggestionList";
import { StoryDetail } from "./StoryDetail";

export interface SuggestionList {
  storyDetails?: { [storycode: string]: StoryDetail };
  suggestionsPerUser: { [userId: number]: IssueSuggestionList };
  publicationTitles: { [publicationcode: string]: string | null };
  authors: { [personcode: string]: string };
}
