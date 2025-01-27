import type { Errorable } from "~socket.io-services";

export const namespaceEndpoint = "/browse";

export type EdgeModelDetails = {
  issuecode: string;
  url: string;
  svgUrl?: string;
  status: "published"| "ongoing" | "ongoing by another user"
  designers: string[];
  photographers: string[];
}

export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract listEdgeModels: (
    callback: (
      value: Errorable<
        {
          results: EdgeModelDetails[];
        },
        "Generic error"
      >,
    ) => void,
  ) => void;

  abstract listEdgeParts: (
    parameters: {
      imageType: "elements" | "photos";
      country: string;
      magazine: string;
    },
    callback: (
      value: Errorable<
        {
          results: string[];
        },
        "Generic error" | "Invalid parameters"
      >,
    ) => void,
  ) => void;
}
