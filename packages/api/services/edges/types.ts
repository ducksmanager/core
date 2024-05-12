import type { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import type { WantedEdge } from "~dm-types/WantedEdge";
import type { edge } from "~prisma-clients/client_dm";

export const namespaceEndpoint = "/edges";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getEdge: (
    publicationcode: string,
    issuenumbers: string[],
    callback: (value: Record<string, EdgeWithModelId>) => void,
  ) => void;
  abstract getPublishedEdges: (
    callback: (value: Pick<edge, "publicationcode" | "issuenumber">[]) => void,
  ) => void;
  abstract getWantedEdges: (callback: (value: WantedEdge[]) => void) => void;
}
