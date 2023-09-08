import { prismaCoa } from "prisma-clients";
import { inducks_issuequotation } from "prisma-clients/client_coa";

import { ExpressCall } from "~routes/_express-call";

const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: inducks_issuequotation[];
    query: { issueCodes: string };
  }>
) => {
  const { issueCodes } = req.query;
  if (!issueCodes) {
    res.writeHead(400);
    res.end();
    return;
  }
  const codes = [...issueCodes.toString().matchAll(ISSUE_CODE_REGEX)];
  if (!codes.length) {
    res.writeHead(400);
    res.end();
  } else if (codes.length > 4) {
    res.writeHead(429);
    res.end();
  } else {
    return res.json(
      await prismaCoa.inducks_issuequotation.findMany({
        where: {
          issuecode: {
            in: codes.map(([code]) => code.replaceAll(/ +/, " ")),
          },
          estimationmin: { not: { equals: null } },
        },
      })
    );
  }
};
