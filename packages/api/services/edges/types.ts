import { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import { WantedEdge } from "~dm-types/WantedEdge";
import { edge } from "~prisma-clients/client_dm";

export interface Services {
  getEdge: (
    publicationcode: string,
    issuenumbers: string[],
    callback: (value: Record<string, EdgeWithModelId>) => void
  ) => void;
  getPublishedEdges: (
    callback: (value: Pick<edge, "publicationcode" | "issuenumber">[]) => void
  ) => void;
  getWantedEdges: (callback: (value: WantedEdge[]) => void) => void;
}

export const NamespaceEndpoint = "/edges";
