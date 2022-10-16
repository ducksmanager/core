import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      (
        await prisma.inducks_issue.groupBy({
          _count: {
            issuenumber: true,
          },
          by: ["publicationcode"],
        })
      ).reduce(
        (acc, { publicationcode, _count }) => ({
          ...acc,
          [publicationcode!]: _count.issuenumber,
        }),
        {} as { [key: string]: number }
      )
    )
  );
};
