import { Handler, Request } from "express";

import { PrismaClient } from "../../prisma/generated/client_dm";

const prisma = new PrismaClient();

export const getUser = async (req: Request) =>
  await prisma.user.findUnique({
    where: { id: req.user.id },
  });
export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(await getUser(req)));
};
