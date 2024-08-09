import type { SimpleStory, SimpleStoryWithPartInfo } from "./SimpleStory";

export interface StorySearchResults<WithIssues extends boolean> {
  results: (WithIssues extends true ? SimpleStoryWithPartInfo : SimpleStory)[];
  hasMore: boolean;
}
