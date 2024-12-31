import type { AugmentedIssue } from "~dm-types/AugmentedIssue";
import type { WantedEdge } from "~dm-types/WantedEdge";
import type { Errorable } from "~socket.io-services";

export default { namespaceEndpoint: "/edges" }
;export type Events =  {


  getEdges: (
    filter: { publicationcode?: string; issuecodes?: string[] }) => Errorable<
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
    
  getPublishedEdges: (
    ) => AugmentedIssue<["issuecode"]>[]
  getWantedEdges: () => WantedEdge[]
}
