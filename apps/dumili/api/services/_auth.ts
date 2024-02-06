import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

import { SessionUser } from "~dm-types/SessionUser";

type SocketWithUser = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>, 
  { user: SessionUser }
>;

const AuthMiddleware = (
  socket: SocketWithUser,
  next: (error?: Error) => void,
  required: boolean
) => {
  const token = socket.handshake.auth.token;

  if (required && token == null) {
    next(new Error("No token provided"));
    return;
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: unknown, user: unknown) => {
      if (required && err) {
        next(new Error(`Invalid token: ${err}`));
      } else {
        if (user) {
          socket.data.user = user as SessionUser;
        }
        next();
      }
    }
  );
};

export const RequiredAuthMiddleware = (
  socket: Socket,
  next: (error?: Error) => void
) => AuthMiddleware(socket, next, true);

export const OptionalAuthMiddleware = (
  socket: Socket,
  next: (error?: Error) => void
) => AuthMiddleware(socket, next, false);
