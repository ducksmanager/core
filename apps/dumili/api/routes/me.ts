import { Request, Response } from "express";

export const get = async (req: Request, res: Response) =>
  res.json({ user: { username: req.user.username } });
