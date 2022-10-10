import bodyParser from "body-parser";
import crypto from "crypto";
import { Handler, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { PrismaClient } from "~prisma_clients/client_dm";
import { User } from "~types/SessionUser";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

const generateAccessToken = (payload: User) =>
  jwt.sign(payload, process.env.TOKEN_SECRET!, {
    expiresIn: `${60 * 24 * 14}m`,
  });

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
          console.log("valid token");
        } else {
          console.log(`Invalid token: ${err}`);
        }
        next();
      }
    );
  }
};

export const post = [
  parseForm,
  (async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex");
    const user = await prisma.user.findFirst({
      where: {
        username,
        password: hashedPassword,
      },
    });
    if (user) {
      const privileges = (
        await prisma.userPermission.findMany({
          where: {
            username,
          },
        })
      ).groupBy("role", "privilege");
      const token = generateAccessToken({
        id: user.id,
        username,
        hashedPassword,
        privileges,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ token }));
    } else {
      res.writeHead(401, { "Content-Type": "application/text" });
      res.end();
    }
  }) as Handler,
];
