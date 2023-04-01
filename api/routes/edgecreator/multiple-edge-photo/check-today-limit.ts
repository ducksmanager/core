import dayjs from "dayjs";

import { PrismaClient } from "~/dist/prisma/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();
export const get = [
  async (
    ...[req, res]: ExpressCall<{
      resBody: {
        uploadedFilesToday: string[];
      };
    }>
  ) =>
    res.json({
      uploadedFilesToday: (
        await prisma.elementImage.findMany({
          where: {
            userId: req.user!.id,
            createdAt: {
              gt: dayjs().hour(0).minute(0).toDate(),
              lt: dayjs().add(1, "day").hour(0).minute(0).toDate(),
            },
          },
        })
      ).map(({ fileName }) => fileName),
    }),
];
