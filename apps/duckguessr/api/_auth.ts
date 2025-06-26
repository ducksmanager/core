import { getPlayer } from "get-player";
import { Socket } from "socket.io";

export const RequiredAuthMiddleware = async (
  { _socket }: { _socket: Socket },
  next: (error?: Error) => void,
) => {
  getPlayer(_socket.handshake.auth.cookie)
    .then((user) => {
      _socket.data.user = user;
      next();
    })
    .catch((e) => {
      next(e);
    });
};
