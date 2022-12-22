import { Handler } from "express";

import { TypedResponse } from "~/TypedResponse";
import {
  inducks_issuequotation,
  PrismaClient,
} from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

const PUBLICATION_CODE_REGEX = /[a-z]+\/[-A-Z0-9]+/g;

export type getType = inducks_issuequotation[];
export const get: Handler = async (req, res: TypedResponse<getType>) => {
  const { publicationCodes } = req.query;
  if (!publicationCodes) {
    res.writeHead(400);
    res.end();
    return;
  }
  const codes = [
    ...publicationCodes.toString().matchAll(PUBLICATION_CODE_REGEX),
  ];
  if (!codes.length) {
    res.writeHead(400);
    res.end();
  } else if (codes.length > 50) {
    res.writeHead(429);
    res.end();
  } else {
    return res.json(
      await prisma.inducks_issuequotation.findMany({
        where: {
          publicationcode: { in: codes.map(([code]) => code) },
          estimationmin: { not: { equals: null } },
        },
      })
    );
  }
};
