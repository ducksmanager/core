
import { Event } from "~dm-types/Event";

import { NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  getEvents: (callback: (value: Event[]) => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/events'
}
