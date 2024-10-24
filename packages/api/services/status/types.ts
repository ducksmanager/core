import type { Errorable } from "~socket.io-services";

export const namespaceEndpoint = "/status";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getDbStatus: (
    callback: (
      value: Errorable<
        void,
        "Some DB checks have failed" | "Some COA tables are empty"
      >,
    ) => void,
  ) => void;
  abstract getPastecStatus: (
    callback: (
      value: Errorable<
        { numberOfImages: number },
        "Pastec /imageIds response is invalid" | "Pastec is unreachable"
      >,
    ) => void,
  ) => void;
  abstract getPastecSearchStatus: (
    callback: (
      value: Errorable<
        { numberOfImages: number },
        | "Pastec search returned no image"
        | "Pastec /searcher response is invalid"
        | "Pastec is unreachable"
      >,
    ) => void,
  ) => void;
}
