import { NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
  sendFeedback: (feedback: string, callback: () => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/feedback'
}
