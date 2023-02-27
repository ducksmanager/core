import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[, res]: ExpressCall<{ resBody: { count: number } }>
) =>
  res.json({
    count: await prisma.user.count(),
  });
