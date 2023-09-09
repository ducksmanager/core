import { prismaDm } from "~/prisma";
import { user } from "~prisma-clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[, res]: ExpressCall<{ resBody: Pick<user, "id" | "username">[] }>
) =>
  res.json(
    await prismaDm.user.findMany({
      select: {
        id: true,
        username: true,
      },
    })
  );
