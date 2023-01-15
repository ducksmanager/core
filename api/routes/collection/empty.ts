import { Prisma, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";
import PromiseReturnType = Prisma.PromiseReturnType;

const prisma = new PrismaClient();

export type postCall = Call<PromiseReturnType<typeof prisma.issue.deleteMany>>;
export const post = async (...[req, res]: ExpressCall<postCall>) => {
  await prisma.issue.deleteMany({
    where: { userId: req.user!.id },
  });
  res.writeHead(200, { "Content-Type": "application/text" });
  res.end();
};
