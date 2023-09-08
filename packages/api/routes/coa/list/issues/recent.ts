import { prismaCoa } from "prisma-clients";
import { inducks_issue } from "prisma-clients/client_coa";

import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[, res]: ExpressCall<{ resBody: inducks_issue[] }>
) =>
  res.json(
    await prismaCoa.inducks_issue.findMany({
      where: {
        oldestdate: {
          lte: new Date().toISOString().split("T")[0],
        },
      },
      orderBy: [{ oldestdate: "desc" }],
      take: 50,
    })
  );
