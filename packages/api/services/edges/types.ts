import type { AugmentedIssue } from "~dm-types/AugmentedIssue";
import type { WantedEdge } from "~dm-types/WantedEdge";
import type { Errorable } from "~socket.io-services/types";

export const namespaceEndpoint = "/edges";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getEdges: (
    filter: { publicationcode?: string; issuecodes?: string[] },
    callback: (
      value: Errorable<
        Record<
          string,
          AugmentedIssue<{
            modelId: number;
            v3: boolean;
            id: number;
            issuecode: string;
          }>
        >,
        "Invalid filter"
      >,
    ) => void,
  ) => void;
  abstract getPublishedEdges: (
    callback: (value: AugmentedIssue<["issuecode"]>[]) => void,
  ) => void;
  abstract getWantedEdges: (callback: (value: WantedEdge[]) => void) => void;
}
