import { SimpleStoryWithPartInfo } from "./SimpleStory";

export interface StorySearchResults {
  results: SimpleStoryWithPartInfo[];
  hasMore: boolean;
}
