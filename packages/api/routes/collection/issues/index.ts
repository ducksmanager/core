import { prismaDm } from "prisma-clients";
import { issue } from "prisma-clients/client_dm";

import { ExpressCall } from "~routes/_express-call";
import { resetDemo } from "~routes/demo/_reset";

export const get = async (...[req, res]: ExpressCall<{ resBody: issue[] }>) => {
  if (req.user!.username === "demo") {
    await resetDemo();
  }
  return res.json(
    await prismaDm.issue.findMany({
      where: {
        userId: req.user!.id,
      },
    })
  );
};
