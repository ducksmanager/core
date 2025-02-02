import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";
import type { user } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

type SocketWithUser = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: SessionUser }
>;

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

export const isValidEmail = (email: string) => EMAIL_REGEX.test(email);

export const generateAccessToken = (payload: Omit<SessionUser, "token">) =>
  jwt.sign({exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, data: payload}, process.env.TOKEN_SECRET!);
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
  required: boolean,
) => {
  const token = socket.handshake.auth.token;

  if (token == null) {
    if (required) {
      next(new Error("No token provided"));
      return;
    } else {
      next();
    }
  }

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: unknown, payload: unknown) => {
      if (required && err) {
        next(new Error(`Invalid token: ${err}`));
      } else {
        const user = (payload as {data?: Omit<SessionUser, 'token'>}).data
        if (user) {
          socket.data.user = { ...user, token } as SessionUser;
        }
        next();
      }
    },
  );
};

export const RequiredAuthMiddleware = (
  { _socket }: { _socket: Socket },
  next: (error?: Error) => void,
) => AuthMiddleware(_socket, next, true);

export const OptionalAuthMiddleware = (
  { _socket }: { _socket: Socket },
  next: (error?: Error) => void,
) => AuthMiddleware(_socket, next, false);

export const UserIsEdgeCreatorEditorAuthMiddleware = (
  socket: SocketWithUser,
  next: (error?: Error) => void,
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
  { _socket }: { _socket: Socket },
  next: (error?: Error) => void,
) => {
  if (
    !_socket.data.user ||
    !["Admin"].includes(_socket.data.user.privileges?.["DucksManager"])
  ) {
    next(new Error("Unauthorized"));
    return;
  }
  next();
};

export const getHashedPassword = (password: string) =>
  crypto.createHash("sha1").update(password).digest("hex");
