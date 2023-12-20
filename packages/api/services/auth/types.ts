import {VerifyErrors} from "jsonwebtoken";
import { Socket as SocketIo } from "socket.io";

export interface Services {
  forgot: (token: string, callback: (value?: VerifyErrors) => void) => void;
  changePassword: (data: { password: string; password2: string; token: string }, callback: (value: {token: string, error?: never}|{token?: never, error: string}) => void) => void;
}

export type Socket = SocketIo<Services>;
