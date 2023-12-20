import { StorySearchResults } from "../../../../../types/StorySearchResults";

export default interface Stories {
  searchStory: (keywords: string[], withIssues: boolean, callback: (value: StorySearchResults) => void) => void;
}
