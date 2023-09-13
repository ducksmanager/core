import { prismaCoa } from "~/prisma";
import { inducks_issuequotation } from "~prisma-clients/client_coa";
import { ExpressCall } from "~routes/_express-call";

const PUBLICATION_CODE_REGEX = /[a-z]+\/[-A-Z0-9]+/g;

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: inducks_issuequotation[];
    query: { publicationCodes: string };
  }>
) => {
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
      await prismaCoa.inducks_issuequotation.findMany({
        where: {
          publicationcode: { in: codes.map(([code]) => code) },
          estimationmin: { not: { equals: null } },
        },
      })
    );
  }
};
