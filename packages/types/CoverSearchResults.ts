export interface SimilarImagesResult {
  image_ids: number[];
  scores: number[];
  tags: string[];
  type: string;
}

export interface CoverSearchResults {
  covers: {
    issuecode: string;
    fullUrl: string;
    publicationcode: string;
    issuenumber: string;
  }[];
  type?: string;
}
