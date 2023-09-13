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
        username: true,
        photos: {
          include: {
            elementImage: true,
          },
        },
      },
      where: {
        isActive: true,
        OR: [
          {
            username: req.user!.username,
          },
          {
            contributors: {
              some: {
                userId: req.user!.id,
                contribution: "photographe",
              },
            },
          },
        ],
      },
    })) as EdgeModel[]
  );
