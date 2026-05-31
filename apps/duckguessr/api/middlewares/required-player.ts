import { Socket } from "socket.io";
import { getPlayer } from "../get-player";

export const RequiredPlayerMiddleware = (
  { _socket }: { _socket: Socket },
  next: (error?: Error) => void,
) => {
  getPlayer({ token: _socket.handshake.auth.token })
    .then((player) => {
      _socket.data.user = player;
    })
    .then(() => {
      next();
    })
    .catch((e) => {
      next(e);
    });
};
