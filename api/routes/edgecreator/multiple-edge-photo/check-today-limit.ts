import dayjs from "dayjs";

import { prismaEdgeCreator } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

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
        await prismaEdgeCreator.elementImage.findMany({
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
