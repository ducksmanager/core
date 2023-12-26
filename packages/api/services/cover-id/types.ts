import { CoverSearchResults } from "~dm-types/CoverSearchResults";

import { Errorable, NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  searchFromCover: (base64: string, callback: (value: Errorable<CoverSearchResults, 'Pastec returned NULL' | 'Pastec returned en error'>) => void) => void;
  downloadCover: (coverId: number, callback: (value: Errorable<string, 'Error'>) => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/cover-id'
}
