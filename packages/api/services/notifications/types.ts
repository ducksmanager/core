import { Socket } from "socket.io";

export interface NotificationServices {
  send: (callback: (value: { notificationsSent: number }) => void) => void;
}

export type NotificationSocket = Socket<NotificationServices>;
