export interface SimilarImagesResult {
  image_ids: number[];
  scores: number[];
  tags: string[];
  type: string;
  bounding_rects: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}