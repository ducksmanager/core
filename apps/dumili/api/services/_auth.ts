import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

import { SessionUser } from "~dm-types/SessionUser";

type SocketWithUser = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>, 
  { user: SessionUser }
>;

export const RequiredAuthMiddleware = (
  socket: SocketWithUser,
  next: (error?: Error) => void,
) => {
  const token = socket.handshake.auth.token;

  if (token == null) {
    next(new Error("No token provided"));
    return;
  }


  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: unknown, user: unknown) => {
      if (err) {
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
