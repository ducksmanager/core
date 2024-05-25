import type { Errorable } from "~socket.io-services/types";

export const namespaceEndpoint = "/save";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract listEdgeModels: (
    callback: (
      value: Errorable<
        {
          results: {
            current: { filename: string; mtime: string }[];
            published: { filename: string; mtime: string }[];
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
