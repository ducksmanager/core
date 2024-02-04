import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

import { prismaDm } from "~/prisma";
import { SessionUser } from "~dm-types/SessionUser";
import { user } from "~prisma-clients/client_dm";

export type SocketWithUser = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: SessionUser }
>;



const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

export const isValidEmail = (email: string) => EMAIL_REGEX.test(email);

export const generateAccessToken = (payload: SessionUser) =>
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

export const UserIsEdgeCreatorEditorAuthMiddleware = (
  socket: SocketWithUser,
  next: (error?: Error) => void
) => {
  if (
    !socket.data.user ||
    !["Edition", "Admin"].includes(socket.data.user.privileges?.["EdgeCreator"])
  ) {
    next(new Error("Unauthorized"));
    return;
  }
  next();
};

export const UserIsAdminMiddleware = (
  socket: SocketWithUser,
  next: (error?: Error) => void
) => {
  if (
    !socket.data.user ||
    !["Admin"].includes(socket.data.user.privileges?.["DucksManager"])
  ) {
    next(new Error("Unauthorized"));
    return;
  }
  next();
};

export const getHashedPassword = (password: string) =>
  crypto.createHash("sha1").update(password).digest("hex");
