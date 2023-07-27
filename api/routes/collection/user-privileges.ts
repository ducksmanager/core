import { prismaDm } from "~/prisma";
import { userPermission } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: userPermission[] }>
) =>
  res.json(
    await prismaDm.userPermission.findMany({
      where: {
        username: req.user!.username,
      },
    })
  );
