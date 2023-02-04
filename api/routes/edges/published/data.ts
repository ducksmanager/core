import { edge, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[, res]: ExpressCall<Pick<edge, "publicationcode" | "issuenumber">[]>
) =>
  res.json(
    await prisma.edge.findMany({
      select: { publicationcode: true, issuenumber: true },
    })
  );
