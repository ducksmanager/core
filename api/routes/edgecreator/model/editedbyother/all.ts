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
