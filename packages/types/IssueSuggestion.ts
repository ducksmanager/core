export interface IssueSuggestion {
  shortIssuecode: string;
  score: number;
  stories: { [storycode: string]: string[] };
  publicationcode: string;
  shortIssuenumber: string;
  oldestdate: string;
}
