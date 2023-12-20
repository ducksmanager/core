import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

import { prismaDm } from "~/prisma";
import { User } from "~dm-types/SessionUser";
import { user } from "~prisma-clients/client_dm";

const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

export const isValidEmail = (email: string) => EMAIL_REGEX.test(email);

export const generateAccessToken = (payload: User) =>
  jwt.sign(payload, process.env.TOKEN_SECRET!, {
    expiresIn: `${60 * 24 * 14}m`,
  });
export const loginAs = async (user: user, hashedPassword: string) =>
  generateAccessToken({
    id: user.id,
    username: user.username,
    hashedPassword,
    privileges: (
      await prismaDm.userPermission.findMany({
        where: {
          username: user.username,
        },
      })
    ).groupBy("role", "privilege"),
  });

export const AuthMiddleware = (socket: Socket, next: (error?: Error) => void) => {
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
        next(new Error("Invalid token: " + err));
        return;
      }
      socket.data.user = user as User;
      next();
    },
  );
}