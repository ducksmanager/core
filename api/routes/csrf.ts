import csrf from "csurf";
import { Handler, Response } from "express";

const csrfProtection = csrf({ cookie: true });

export type getType = {
  csrfToken: string;
};
export const get = [
  csrfProtection,
  (async (req, res: Response<getType>) =>
    res.json({ csrfToken: req.csrfToken() })) as Handler,
];
