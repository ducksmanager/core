import csrf from "csurf";
import { Handler } from "express";

const csrfProtection = csrf({ cookie: true });

export const get = [
  csrfProtection,
  (async (req, res) => res.json({ csrfToken: req.csrfToken() })) as Handler,
];
