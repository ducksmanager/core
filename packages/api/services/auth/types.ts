import { Socket as SocketIo } from "socket.io";

import { Errorable, NamespaceGeneric } from "../types";

export interface Services {
  forgot: (token: string, callback: (data: { error?: string }) => void) => void;
  changePassword: (data: { password: string; password2: string; token: string }, callback: (value: Errorable<{ token: string }>) => void) => void;
}

export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/auth';
}

export type Socket = SocketIo<Services>;
