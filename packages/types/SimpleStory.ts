import { SimpleIssue } from "./SimpleIssue";

export interface SimpleStory {
  storycode: string;
  entirepages: number;
  title: string;
  score: number;
  issues: SimpleIssue[] | null;
}
