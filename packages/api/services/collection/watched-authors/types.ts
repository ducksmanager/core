import { authorUser } from "~prisma-clients/client_dm";
import { Errorable } from "~services/types";

export default interface WatchedAuthors {
  getWatchedAuthors: (callback: (value: authorUser[]) => void) => void;
  deleteWatchedAuthor: (personcode: string, callback: () => void) => void;
  updateWatchedAuthor: (
    data: authorUser,
    callback: (value: Errorable<void, "Error">) => void
  ) => void;
  addWatchedAuthor: (
    personcode: string,
    callback: (value: Errorable<void, "Error">) => void
  ) => void;
}
