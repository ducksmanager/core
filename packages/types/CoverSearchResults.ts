import { inducks_issuequotation } from "~prisma-clients/client_coa";

export interface SimilarImagesResult {
  image_ids: number[];
  scores: number[];
  tags: string[];
  type: string;
}

export interface CoverSearchResults {
  covers: ({
    issuecode: string;
    fullUrl: string;
    publicationcode: string;
    issuenumber: string;
  } & Pick<inducks_issuequotation, 'estimationMin' | 'estimationMax'>)[];
  type?: string;
}
