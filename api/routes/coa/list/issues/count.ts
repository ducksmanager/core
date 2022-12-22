import { Handler } from "express";

import { TypedResponse } from "~/TypedResponse";
import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export type getType = { [publicationcode: string]: number };
export const get: Handler = async (req, res: TypedResponse<getType>) =>
  res.json(
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
      {} as { [publicationcode: string]: number }
    )
  );
