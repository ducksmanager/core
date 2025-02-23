import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";

const authenticateUser = async (token?: string | null): Promise<SessionUser> =>
  new Promise((resolve, reject) => {
    if (!token) {
      reject("No token provided");
      return;
    }

    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: unknown, payload: unknown) => {
        if (err) {
          console.error(err);
          reject(`Invalid token: ${err}`);
        } else {
          const user = (payload as { data?: Omit<SessionUser, "token"> }).data;
          if (user) {
            resolve(user as SessionUser);
          } else {
            console.error(`Invalid user: ${user}, payload: ${payload}`);
            reject(`Invalid user: ${user}`);
          }
        }
      },
    );
  });

export const RequiredAuthMiddleware = (
  { _socket }: { _socket: Socket },
  next: (error?: Error) => void,
) => {
  authenticateUser(_socket.handshake.auth.token)
    .then((user) => {
      _socket.data.user = user;
      next();
    })
    .catch((e) => {
      next(e);
    });
};
