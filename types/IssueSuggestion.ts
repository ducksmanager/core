export interface IssueSuggestion {
  issuecode: string;
  score: number;
  stories: { [storycode: string]: string[] };
  publicationcode: string;
  issuenumber: string;
  oldestdate: Date;
}
