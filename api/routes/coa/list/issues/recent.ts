import { Handler } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export type getType = Prisma.PromiseReturnType<
  typeof prisma.inducks_issue.findMany
>;
export const get: Handler = async (req, res) =>
  res.json(
    await prisma.inducks_issue.findMany({
      where: {
        oldestdate: {
          lte: new Date().toISOString().split("T")[0],
        },
      },
      orderBy: [{ oldestdate: "desc" }],
      take: 50,
    })
  );
