import type { BookcaseEdge } from "~dm-types/BookcaseEdge";
import type { Errorable } from "~socket.io-services/types";

export default abstract class {
  static namespaceEndpoint: string = "/bookcase";
   abstract getBookcase: (
    username: string,
    callback: (
      value: Errorable<
        { edges: BookcaseEdge[] },
        "Unauthorized" | "Forbidden" | "Not found"
      >
    ) => void
  ) => void;


  abstract getBookcaseOrder: (
    username: string,
    callback: (
      value: Errorable<
        { publicationCodes: string[] },
        "Unauthorized" | "Forbidden" | "Not found"
      >
    ) => void
  ) => void;

  abstract setBookcaseOrder: (
    publicationCodes: string[],
    callback: (max: number | undefined) => void
  ) => void;


  abstract getBookcaseOptions: (
    username: string,
    callback: (
      value: Errorable<
        {
          textures: {
            bookcase: string;
            bookshelf: string;
          };
          showAllCopies: boolean;
        },
        "Unauthorized" | "Forbidden" | "Not found"
      >
    ) => void
  ) => void;

  abstract setBookcaseOptions: (
    data: {
      textures: { bookcase: string; bookshelf: string };
      showAllCopies: boolean;
    },
    callback: (value: string) => void
  ) => void;
}