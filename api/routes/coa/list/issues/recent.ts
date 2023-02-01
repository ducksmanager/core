import { Prisma, PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<
  Prisma.PromiseReturnType<typeof prisma.inducks_issue.findMany>
>;
export const get = async (...[, res]: ExpressCall<getCall>) =>
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
