import type { SimpleIssueWithPartInfo } from "./SimpleIssue";

export interface SimpleStory {
  storycode: string;
  entirepages: number;
  kind: "a" | "c" | "f" | "g" | "i" | "k" | "n" | "t" | "L" | "P";
  title: string;
  score: number;
}

export interface SimpleStoryWithPartInfo extends SimpleStory {
  issues: SimpleIssueWithPartInfo[];
}
