import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { User } from "~dm_types/SessionUser";

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
        return res.sendStatus(401);
      }
      req.user = user as User;
      next();
    }
  );
};
