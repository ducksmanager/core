import bodyParser from "body-parser";
import { Handler, Response } from "express";

import { inducks_issue, PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export type postType = { [issuecode: string]: inducks_issue };
export const post = [
  parseForm,
  (async (req, res: Response<postType>) =>
    res.json(
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
    )) as Handler,
];
