import { Errorable } from "~services/types";

export default interface Options {
  getBookcaseOrder: (
    username: string,
    callback: (
      value: Errorable<
        { publicationCodes: string[] },
        "Unauthorized" | "Forbidden" | "Not found"
      >
    ) => void
  ) => void;

  setBookcaseOrder: (
    publicationCodes: string[],
    callback: (max: number | undefined) => void
  ) => void;
}

