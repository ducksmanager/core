

import { Errorable, NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  loginAsDemo: (callback: (data: Errorable<{ token: string }, 'No demo user found'>) => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/demo'
}
