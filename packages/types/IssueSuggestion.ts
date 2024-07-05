export interface IssueSuggestion {
  shortIssuecode: string;
  score: number;
  stories: { [storycode: string]: string[] };
  publicationcode: string;
  issuenumber: string;
  oldestdate: string;
}
