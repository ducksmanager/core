import { PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<{ [publicationcode: string]: number }>;
export const get = async (...[, res]: ExpressCall<getCall>) =>
  res.json(
    (
      await prisma.inducks_issue.groupBy({
        _count: {
          issuenumber: true,
        },
        by: ["publicationcode"],
      })
    ).reduce(
      (acc, { publicationcode, _count }) => ({
        ...acc,
        [publicationcode!]: _count.issuenumber,
      }),
      {} as { [publicationcode: string]: number }
    )
  );
