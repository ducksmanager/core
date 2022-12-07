import bodyParser from "body-parser";
import crypto from "crypto";
import { Handler, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { loginAs } from "~/routes/auth/util";
import { PrismaClient } from "~prisma_clients/client_dm";
import { User } from "~types/SessionUser";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export const authenticateToken = (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")?.[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: unknown, user: unknown) => {
      if (err) {
        return res.sendStatus(403);
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
  if (!["Edition", "Admin"].includes(req.user?.privileges?.["EdgeCreator"])) {
    return res.sendStatus(403);
  }
  next();
};

export const checkUserIsAdmin = (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  if (!["Admin"].includes(req.user?.privileges?.["DucksManager"])) {
    return res.sendStatus(403);
  }
  next();
};

export const injectTokenIfValid = (
  req: Request,
  res: Response,
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

export const post = [
  parseForm,
  (async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = getHashedPassword(password);
    const user = await prisma.user.findFirst({
      where: {
        username,
        password: hashedPassword,
      },
    });
    if (user) {
      const token = await loginAs(user, hashedPassword);

      return res.json({ token });
    } else {
      res.writeHead(401, { "Content-Type": "application/text" });
      res.end();
    }
  }) as Handler,
];
