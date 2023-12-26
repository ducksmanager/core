

import { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import { WantedEdge } from "~dm-types/WantedEdge";
import { edge } from "~prisma-clients/client_dm";

import { NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  getEdge: (publicationcode: string, issuenumbers: string[], callback: (value: Record<string, EdgeWithModelId>) => void) => void;
  getPublishedEdges: (callback: (value: Pick<edge, "publicationcode" | "issuenumber">[]) => void) => void;
  getWantedEdges: (publicationcode: string, issuenumbers: string[] | undefined, callback: (value: WantedEdge[]) => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/edges'
}
