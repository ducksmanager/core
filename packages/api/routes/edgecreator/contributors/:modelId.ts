import { prismaEdgeCreator } from "~/prisma";
import { edgeContributor } from "~prisma-schemas/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: edgeContributor[];
    params: { modelId: string };
  }>
) =>
  res.json(
    await prismaEdgeCreator.edgeContributor.findMany({
      where: {
        modelId: parseInt(req.params.modelId),
      },
    })
  );
