export interface Issue {
  issuecode: string;
  score: number;
  stories: { [key: string]: string[] };
  publicationcode: string;
  issuenumber: string;
  oldestdate: string;
}

export interface StoryDetail {
  storycomment: string;
  title: string;
  personcode: string;
}

export interface SuggestionList {
  minScore: number;
  maxScore: number;
  issues: { [key: string]: Issue };
  authors: { [key: string]: string };
  storyDetails: { [key: string]: StoryDetail };
  publicationTitles: { [key: string]: string };
}
