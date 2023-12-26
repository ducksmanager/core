import { Errorable } from "~/services/types";
import { authorUser } from "~prisma-clients/client_dm";

export default interface WatchedAuthors {
  getWatchedAuthors: (callback: (value: authorUser[]) => void) => void;
  deleteWatchedAuthor: (personcode: string, callback: () => void) => void;
  updateWatchedAuthor: (personcode: string, notation: number, callback: (value: Errorable<void, 'Error'>) => void) => void;
  addWatchedAuthor: (personcode: string, callback: (value: Errorable<void, 'Error'>) => void) => void;
}
