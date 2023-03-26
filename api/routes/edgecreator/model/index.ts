import { PrismaClient } from "~/dist/prisma/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";
import { EdgeModel } from "~types/EdgeModel";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: EdgeModel[] }>
) =>
  res.json(
    (await prisma.edgeModel.findMany({
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
