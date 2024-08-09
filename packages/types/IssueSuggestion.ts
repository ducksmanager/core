export interface IssueSuggestion {
  issuecode: string;
  score: number;
  stories: { [storycode: string]: string[] };
  oldestdate: string;
}
