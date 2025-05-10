import { prismaCoa } from "~/prisma";
import { inducks_issuequotation } from "~prisma-schemas/client_coa";
import { ExpressCall } from "~routes/_express-call";

const ISSUE_CODE_REGEX = /[a-z]+\/[-A-Z0-9 ]+/g;

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: inducks_issuequotation[];
    query: { issueCodes: string };
  }>
) => {
  const { issueCodes: queryIssueCodes } = req.query;
  if (!queryIssueCodes) {
    res.writeHead(400);
    res.end();
    return;
  }
  const issuecodes = [...queryIssueCodes.toString().matchAll(ISSUE_CODE_REGEX)];
  if (!issuecodes.length) {
    res.writeHead(400);
    res.end();
  } else if (issuecodes.length > 4) {
    res.writeHead(429);
    res.end();
  } else {
    return res.json(
      await prismaCoa.inducks_issuequotation.findMany({
        where: {
          issuecode: {
            in: issuecodes.map(([issuecode]) => issuecode.replaceAll(/ +/, " ")),
          },
          estimationMin: { not: { equals: null } },
        },
      })
    );
  }
};
