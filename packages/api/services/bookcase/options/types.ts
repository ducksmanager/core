import { Errorable } from "~services/types";

export default interface Options {
  getBookcaseOptions: (
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

  setBookcaseOptions: (
    data: {
      textures: { bookcase: string; bookshelf: string };
      showAllCopies: boolean;
    },
    callback: (value: string) => void
  ) => void;
}
