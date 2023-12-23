import { Socket as SocketIo } from "socket.io";

import { Errorable } from "../types";

export interface Services {
  forgot: (token: string, callback: (data: { error?: string }) => void) => void;
  changePassword: (data: { password: string; password2: string; token: string }, callback: (value: Errorable<{ token: string }>) => void) => void;
}

export type Socket = SocketIo<Services>;
