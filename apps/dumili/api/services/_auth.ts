import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";

type SocketWithUser = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user: SessionUser }
>;

export const authenticateUser = async (
  token?: string | null,
): Promise<SessionUser> => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject("No token provided");
      return;
    }

    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: unknown, user: unknown) => {
        if (err) {
          reject(`Invalid token: ${err}`);
        } else {
          if (user) {
            resolve(user as SessionUser);
          }
          reject(`Invalid user: ${user}`);
        }
      },
    );
  });
};

export const RequiredAuthMiddleware = (
  socket: SocketWithUser,
  next: (error?: Error) => void,
) => {
  authenticateUser(socket.handshake.auth.token)
    .then((user) => {
      socket.data.user = user;
      next();
    })
    .catch((e) => {
      next(e);
    });
};
