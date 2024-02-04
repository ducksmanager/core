import { CoverSearchResults } from "~dm-types/CoverSearchResults";
import { Errorable } from "~socket.io-services/types";

export default abstract class {
  static namespaceEndpoint: string = "/cover-id";

  abstract searchFromCover: (
    base64: string,
    callback: (
      value: Errorable<
        CoverSearchResults,
        "Pastec returned NULL" | "Pastec returned en error"
      >
    ) => void
  ) => void;
  abstract downloadCover: (
    coverId: number,
    callback: (value: Errorable<string, "Error">) => void
  ) => void;
}
