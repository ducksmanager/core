import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface User {
  id: number;
  username: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")?.[1];

  if (token == null) return res.status(401).send("No token provided");

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: unknown, user: unknown) => {
      if (err) {
        return res.status(401).send("Invalid token");
      }
      req.user = user as User;
      next();
    }
  );
};
