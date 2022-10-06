import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

const PUBLICATION_CODE_REGEX = /[a-z]+\/[-A-Z0-9]+/g;

export const get: Handler = async (req, res) => {
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
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        await prisma.inducks_issuequotation.findMany({
          where: {
            publicationcode: { in: codes.map(([code]) => code) },
            estimationmin: { not: { equals: null } },
          },
        })
      )
    );
  }
};