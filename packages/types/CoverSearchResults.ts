import { inducks_issuequotation } from "~prisma-clients/client_coa";

export interface SimilarImagesResult {
  image_ids: number[];
  scores: number[];
  tags: string[];
  type: string;
}

export interface CoverSearchResults {
  covers: ({
    shortIssuecode: string;
    fullUrl: string;
    publicationcode: string;
    issuenumber: string;
    popularity: number;
  } & Pick<inducks_issuequotation, "estimationMin" | "estimationMax">)[];
  type?: string;
}
