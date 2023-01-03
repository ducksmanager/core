import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<{ count: number }>;
export const get = async (...[, res]: ExpressCall<getCall>) =>
  res.json({
    count: await prisma.user.count(),
  });
