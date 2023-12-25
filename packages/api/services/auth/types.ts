import { Socket as SocketIo } from "socket.io";

import { Errorable, NamespaceGeneric } from "../types";

export interface Services {
  forgot: (token: string, callback: (data: { error?: string }) => void) => void;
  changePassword: (data: { password: string; password2: string; token: string }, callback: (value: Errorable<
    { token: string },
    'Invalid token' |
    'Your password should be at least 6 characters long' |
    'The two passwords should be identical' |
    'Something went wrong'
  >) => void) => void;
}

export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/auth';
}

export type Socket = SocketIo<Services>;
