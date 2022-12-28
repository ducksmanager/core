import { Handler, Response } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export type getType = { count: number };
export const get: Handler = async (req, res: Response<getType>) =>
  res.json({
    count: await prisma.user.count(),
  });
