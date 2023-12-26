import { NamespaceGeneric, SocketGeneric } from "../types";

export type Decision = 'approve' | 'refuse';

export interface Services {
  approveOrDenyPresentationText: (sentence: string, userId: number, decision: Decision, callback: () => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/presentation-text'
}
