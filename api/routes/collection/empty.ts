import { Handler, Response } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_dm";
import PromiseReturnType = Prisma.PromiseReturnType;

const prisma = new PrismaClient();

export type postType = PromiseReturnType<typeof prisma.issue.deleteMany>;
export const post: Handler = async (req, res: Response<postType>) => {
  const { id: userId } = req.user;
  await prisma.issue.deleteMany({
    where: { userId },
  });
  res.writeHead(200, { "Content-Type": "application/text" });
  res.end();
};
