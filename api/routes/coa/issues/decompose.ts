import bodyParser from "body-parser";

import { inducks_issue, PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export type postCall = Call<
  { [issuecode: string]: inducks_issue },
  undefined,
  { issueCodes: string }
>;
export const post = [
  parseForm,
  async (...[req, res]: ExpressCall<postCall>) =>
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
    ),
];
