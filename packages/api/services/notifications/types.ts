import { NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  send: (callback: (value: { notificationsSent: number }) => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/notifications'
}
