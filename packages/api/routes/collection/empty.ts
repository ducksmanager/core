import { prismaDm } from "prisma-clients";

import { ExpressCall } from "~routes/_express-call";

export const post = async (
  ...[req, res]: ExpressCall<Record<string, never>>
) => {
  await prismaDm.issue.deleteMany({
    where: { userId: req.user!.id },
  });
  res.writeHead(200, { "Content-Type": "application/text" });
  res.end();
};
