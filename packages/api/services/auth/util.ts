import crypto from "crypto";
import { Request, Response } from "express";
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

const AuthMiddleware = (socket: Socket, next: (error?: Error) => void, required: boolean) => {
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
      }
      else {
        socket.data.user = user;
        next();
      }
    },
  );
}

export const RequiredAuthMiddleware = (socket: Socket, next: (error?: Error) => void) => AuthMiddleware(socket, next, true)

export const OptionalAuthMiddleware = (socket: Socket, next: (error?: Error) => void) => AuthMiddleware(socket, next, false)


export const authenticateToken = (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  // Signup
  if (req.method === "PUT" && req.url === "/collection/user") {
    next();
    return;
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")?.[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: unknown, user: unknown) => {
      if (err) {
        return res.sendStatus(401);
      }
      req.user = user as User;
      next();
    }
  );
};

export const checkUserIsEdgeCreatorEditor = (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  if (
    !req.user ||
    !["Edition", "Admin"].includes(req.user.privileges?.["EdgeCreator"])
  ) {
    return res.sendStatus(403);
  }
  next();
};

export const checkUserIsAdmin = (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  if (!req.user || !["Admin"].includes(req.user.privileges?.["DucksManager"])) {
    return res.sendStatus(403);
  }
  next();
};

export const getHashedPassword = (password: string) =>
  crypto.createHash("sha1").update(password).digest("hex");
