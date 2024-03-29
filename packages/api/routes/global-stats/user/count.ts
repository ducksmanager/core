import { prismaDm } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[, res]: ExpressCall<{ resBody: { count: number } }>
) =>
  res.json({
    count: await prismaDm.user.count(),
  });
