import { PrismaClient, userPermission } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: userPermission[] }>
) =>
  res.json(
    await prisma.userPermission.findMany({
      where: {
        username: req.user!.username,
      },
    })
  );
