import { edge, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<Pick<edge, "publicationcode" | "issuenumber">[]>;
export const get = async (...[, res]: ExpressCall<getCall>) =>
  res.json(
    await prisma.edge.findMany({
      select: { publicationcode: true, issuenumber: true },
    })
  );
