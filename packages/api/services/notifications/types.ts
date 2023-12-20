import { Socket as SocketIo} from "socket.io";

export interface Services {
  send: (callback: (value: { notificationsSent: number }) => void) => void;
}

export type Socket = SocketIo<Services>;
