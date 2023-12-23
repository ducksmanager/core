import { StorySearchResults } from "~dm-types/StorySearchResults";

export default interface Stories {
  searchStory: (keywords: string[], withIssues: boolean, callback: (value: StorySearchResults) => void) => void;
}
