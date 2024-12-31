import type { Errorable } from "~socket.io-services";
import type { ExportPaths } from "~types/ExportPaths";
import type { ModelContributor } from "~types/ModelContributor";

export const namespaceEndpoint = "/save";
export default abstract class {


  abstract saveEdge: (
    parameters: {
      runExport: boolean;
      runSubmit: boolean;
      issuecode: string;
      contributors: ModelContributor[];
      content: string;
    },
    callback: (
      value: Errorable<
        {
          results: { paths: ExportPaths; isNew: boolean };
        },
        "Generic error"
      >,
    ) => void,
  ) => void;
}
