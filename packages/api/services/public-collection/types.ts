import { issue } from "~prisma-clients/client_dm";

import { Errorable, NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  getPublicCollection: (username: string, callback: (value: Errorable<issue[], 'User not found' | 'This user does not allow sharing'>) => void) => void;
}

export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/public-collection'
}

export type Socket = SocketGeneric<Services>;
