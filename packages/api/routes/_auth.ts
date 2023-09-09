import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { User } from "~types/SessionUser";

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

export const injectTokenIfValid = (
  req: Request,
  _: Response,
  next: CallableFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    next();
  } else {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: unknown, user: unknown) => {
        if (user) {
          req.user = user as User;
        } else {
          console.log(`Invalid token: ${err}`);
        }
        next();
      }
    );
  }
};

export const getHashedPassword = (password: string) =>
  crypto.createHash("sha1").update(password).digest("hex");
