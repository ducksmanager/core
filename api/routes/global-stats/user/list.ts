import { PrismaClient, user } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[, res]: ExpressCall<{ resBody: Pick<user, "id" | "username">[] }>
) =>
  res.json(
    await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    })
  );
