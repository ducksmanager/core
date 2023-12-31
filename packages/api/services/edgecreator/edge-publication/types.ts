import { Errorable } from "~services/types";

export default interface EdgeSprites {
  publishEdge: (
    data: {
      publicationcode: string;
      issuenumber: string;
      designers: string[];
      photographers: string[];
    },
    callback: (
      data: Errorable<
        {
          publicationcode: string;
          issuenumber: string;
          isNew: boolean;
          edgeId: number;
          contributors: number[];
          url: string;
        },
        "Invalid publication code"
      >
    ) => void
  ) => void;
}
