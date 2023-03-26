import {
  edgeContributor,
  PrismaClient,
} from "~/dist/prisma/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: edgeContributor[];
    params: { modelId: string };
  }>
) =>
  res.json(
    await prisma.edgeContributor.findMany({
      where: {
        modelId: parseInt(req.params.modelId),
      },
    })
  );
