import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const post = async (...[req, res]: ExpressCall<undefined>) => {
  await prisma.issue.deleteMany({
    where: { userId: req.user!.id },
  });
  res.writeHead(200, { "Content-Type": "application/text" });
  res.end();
};
