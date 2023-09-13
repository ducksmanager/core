import { prismaEdgeCreator } from "~/prisma";
import { EdgeModel } from "~dm-types/EdgeModel";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: EdgeModel[] }>
) =>
  res.json(
    (await prismaEdgeCreator.edgeModel.findMany({
      select: {
        id: true,
        country: true,
        magazine: true,
        issuenumber: true,
      },
      where: {
        isActive: true,
        contributors: {
          some: {
            userId: req.user!.id,
            contribution: "photographe",
          },
        },
        OR: [
          {
            username: {
              not: req.user!.username,
            },
          },
          {
            username: null,
          },
        ],
      },
    })) as EdgeModel[]
  );
