export interface IssueSuggestion {
  issuecode: string;
  score: number;
  stories: { [key: string]: string[] };
  publicationcode: string;
  issuenumber: string;
  oldestdate: Date;
}
