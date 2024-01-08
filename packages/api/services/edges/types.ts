import { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import { WantedEdge } from "~dm-types/WantedEdge";
import { edge } from "~prisma-clients/client_dm";

export default abstract class {
  static namespaceEndpoint = "/edges";

  abstract getEdge: (
    publicationcode: string,
    issuenumbers: string[],
    callback: (value: Record<string, EdgeWithModelId>) => void
  ) => void;
  abstract getPublishedEdges: (
    callback: (value: Pick<edge, "publicationcode" | "issuenumber">[]) => void
  ) => void;
  abstract getWantedEdges: (callback: (value: WantedEdge[]) => void) => void;
}

