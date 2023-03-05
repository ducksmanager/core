import { inducks_issue, PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[, res]: ExpressCall<{ resBody: inducks_issue[] }>
) =>
  res.json(
    await prisma.inducks_issue.findMany({
      where: {
        oldestdate: {
          lte: new Date().toISOString().split("T")[0],
        },
      },
      orderBy: [{ oldestdate: "desc" }],
      take: 50,
    })
  );
