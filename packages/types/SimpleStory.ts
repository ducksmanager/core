import { SimpleIssue } from "./SimpleIssue";

export interface SimpleStory {
  storycode: string;
  title: string;
  score: number;
  issues: SimpleIssue[] | null;
}
