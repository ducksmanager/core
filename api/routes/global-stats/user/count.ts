import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const count = await prisma.user.count();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      count,
    })
  );
};
