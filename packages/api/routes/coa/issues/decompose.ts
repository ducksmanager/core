import bodyParser from "body-parser";
import { prismaCoa } from "prisma-clients";
import { inducks_issue } from "prisma-clients/client_coa";

import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: Record<string, inducks_issue>;
      reqBody: { issueCodes: string };
    }>
  ) =>
    res.json(
      (
        await prismaCoa.inducks_issue.findMany({
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
