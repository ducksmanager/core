import { inducks_issue } from "ducksmanager/api/dist/prisma/client_coa";
import { cover } from "ducksmanager/api/dist/prisma/client_cover_info";

export interface SimilarImagesResult {
  image_ids: number[];
  scores: number[];
  tags: string[];
  type: string;
}

export interface CoverSearchResults {
  covers: (cover & Pick<inducks_issue, "publicationcode" | "issuenumber">)[];
  type?: string;
}
