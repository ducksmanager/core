import { simple_issue } from "./SimpleIssue";

export interface simple_story {
  storycode: string;
  title: string;
  score: number;
  issues: simple_issue[] | null;
}
