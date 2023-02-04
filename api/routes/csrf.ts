import csrf from "csurf";

import { ExpressCall } from "~routes/_express-call";

const csrfProtection = csrf({ cookie: true });

export const get = [
  csrfProtection,
  async (
    ...[req, res]: ExpressCall<{
      csrfToken: string;
    }>
  ) => res.json({ csrfToken: req.csrfToken() }),
];
