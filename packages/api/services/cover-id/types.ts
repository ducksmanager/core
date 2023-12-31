import { CoverSearchResults } from "~dm-types/CoverSearchResults";

import { Errorable } from "../types";

export interface Services {
  searchFromCover: (
    base64: string,
    callback: (
      value: Errorable<
        CoverSearchResults,
        "Pastec returned NULL" | "Pastec returned en error"
      >
    ) => void
  ) => void;
  downloadCover: (
    coverId: number,
    callback: (value: Errorable<string, "Error">) => void
  ) => void;
}

export const NamespaceEndpoint = "/cover-id";
