import { Handler } from "express";

import { PrismaClient } from "../../../../prisma/generated/client_coa";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      await prisma.inducks_issue.findMany({
        where: {
          oldestdate: {
            lte: new Date().toISOString().split("T")[0],
          },
        },
        orderBy: [{ oldestdate: "desc" }],
        take: 50,
      })
    )
  );
};
