import type { IssueWithIssuecodeOnly } from "AllNonNullable";

import type { SimpleIssueWithPartInfo } from "./SimpleIssue";

export interface SimpleStory {
  storycode: string;
  entirepages: number;
  title: string;
  score: number;
  issues: IssueWithIssuecodeOnly[];
}

export interface SimpleStoryWithPartInfo extends SimpleStory {
  issues: SimpleIssueWithPartInfo[];
}
