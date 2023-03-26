import { PrismaClient } from "~/dist/prisma/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";
import { EdgeModel } from "~types/EdgeModel";

const prisma = new PrismaClient();

export const get = async (...[, res]: ExpressCall<{ resBody: EdgeModel[] }>) =>
  res.json(
    await prisma.edgeModel.findMany({
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
