import type { CoverSearchResults } from "~dm-types/CoverSearchResults";
import type { EitherOr, Errorable } from "~socket.io-services/types";

export abstract class InterServerEvents {
  abstract searchFromCover: (
    input: EitherOr<{ base64?: string }, { url?: string }>,
    callback: (
      value: Errorable<
        CoverSearchResults,
        "Pastec returned NULL" | "Pastec returned en error"
      >,
    ) => void,
  ) => void;
}

export const namespaceEndpoint = "/cover-id";
export default abstract class extends InterServerEvents {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getCoverUrl: (
    coverId: number,
    callback: (value: string) => void,
  ) => void;

  abstract downloadCover: (
    coverId: number,
    callback: (value: Errorable<{ buffer: Buffer }, "Error">) => void,
  ) => void;
}
