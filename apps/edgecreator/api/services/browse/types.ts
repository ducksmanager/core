import type { Errorable } from "~socket.io-services/types";

export const namespaceEndpoint = "/browse";

export interface EdgeModelDetails {
  filename: string;
  designers: string[];
  photographers: string[];
}

export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract listEdgeModels: (
    callback: (
      value: Errorable<
        {
          results: {
            current: EdgeModelDetails[];
            published: EdgeModelDetails[];
          };
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
