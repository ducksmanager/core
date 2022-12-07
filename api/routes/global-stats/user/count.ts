import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) =>
  res.json({
    count: await prisma.user.count(),
  });
