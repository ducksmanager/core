import type { SimpleIssueWithPartInfo } from "./SimpleIssue";

export interface SimpleStory {
  storycode: string;
  entirepages: number;
  title: string;
  score: number;
  issuecodes: string[];
}

export interface SimpleStoryWithPartInfo extends SimpleStory {
  issues: SimpleIssueWithPartInfo[];
}
