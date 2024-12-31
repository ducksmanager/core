import type { CoverSearchResults } from "~dm-types/CoverSearchResults";
import type { EitherOr, Errorable } from "~socket.io-services";

export type InterServerEvents = {
  searchFromCover: (
    input: EitherOr<{ base64?: string }, { url?: string }>) => Errorable<
        CoverSearchResults,
        "Pastec returned NULL" | "Pastec returned en error"
      >
}

export default { namespaceEndpoint: "/cover-id" }
export type Events = InterServerEvents & {
  getCoverUrl: (
    coverId: number) => string

  downloadCover: (
    coverId: number) => Errorable<{ buffer: Buffer }, "Error">
}
