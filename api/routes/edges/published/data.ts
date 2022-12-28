import { Handler, Response } from "express";

import { edge, PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

export type getType = Pick<edge, "publicationcode" | "issuenumber">[];
export const get: Handler = async (req, res: Response<getType>) =>
  res.json(
    await prisma.edge.findMany({
      select: { publicationcode: true, issuenumber: true },
    })
  );
