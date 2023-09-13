import { prismaEdgeCreator } from "~/prisma";
import { EdgeModel } from "~dm-types/EdgeModel";
import { ExpressCall } from "~routes/_express-call";

export const get = async (...[, res]: ExpressCall<{ resBody: EdgeModel[] }>) =>
  res.json(
    await prismaEdgeCreator.edgeModel.findMany({
      select: {
        id: true,
        country: true,
        magazine: true,
        issuenumber: true,
        photos: {
          include: {
            elementImage: true,
          },
        },
        contributors: true,
      },
      where: {
        username: null,
        isActive: false,
      },
    })
  );
