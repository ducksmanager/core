import bodyParser from "body-parser";
import crypto from "crypto";
import { Handler, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { call } from "../call-api";
const parseForm = bodyParser.json();

interface User {
  id: number;
  username: string;
  hashedPassword: string;
  privileges: { [key: string]: string };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

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
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
};

export const post = [
  parseForm,
  (async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex");
    const privileges = (
      await call("/collection/privileges", "ducksmanager", {}, "GET", true, {
        username,
        password: hashedPassword,
      })
    ).data;
    const token = generateAccessToken({
      id: 117, // TODO
      username,
      hashedPassword,
      privileges,
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ token }));
  }) as Handler,
];
