import csrf from "csurf";

import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const csrfProtection = csrf({ cookie: true });

export type getCall = Call<{
  csrfToken: string;
}>;
export const get = [
  csrfProtection,
  async (...[req, res]: ExpressCall<getCall>) =>
    res.json({ csrfToken: req.csrfToken() }),
];
