export interface SimilarImagesResult {
  imageIds: number[];
  scores: number[];
  tags: string[];
  type: string;
}

export interface CoverSearchResults {
  issues: string[];
  imageIds: number[];
  type?: string;
}
