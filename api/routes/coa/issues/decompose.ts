import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  (async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify(
        (
          await prisma.inducks_issue.findMany({
            where: {
              issuecode: {
                in: req.body.issueCodes.split(","),
              },
            },
          })
        ).reduce(
          (acc, value) => ({
            ...acc,
            [value.issuecode]: value,
          }),
          {}
        )
      )
    );
  }) as Handler,
];
