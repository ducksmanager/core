import {
  edge,
  PrismaClient as PrismaDmClient,
} from "~prisma_clients/client_dm";
import {
  edgeModel,
  PrismaClient as PrismaEdgecreatorClient,
} from "~prisma_clients/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

const prismaDm = new PrismaDmClient();
const prismaEdgecreator = new PrismaEdgecreatorClient();

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: Record<string, edge & { modelId: number }>;
    params: {
      countrycode: string;
      magazinecode: string;
      issuenumbers?: string;
    };
  }>
) => {
  const edgeModels: Record<string, edgeModel> = (
    await prismaEdgecreator.edgeModel.findMany({
      where: {
        country: req.params.countrycode,
        magazine: req.params.magazinecode,
        issuenumber:
          (req.params.issuenumbers || "_") !== "_"
            ? {
                in: req.params.issuenumbers!.split("/"),
              }
            : undefined,
      },
    })
  ).reduce((acc, model) => ({ ...acc, [model.issuenumber]: model }), {});

  const publishedEdges = (
    await prismaDm.edge.findMany({
      select: { id: true, publicationcode: true, issuenumber: true },
      where: {
        publicationcode: `${req.params.countrycode}/${req.params.magazinecode}`,
      },
    })
  ).reduce(
    (acc, edge) => ({
      ...acc,
      [edge.issuenumber]: {
        ...edge,
        modelId: edgeModels[edge.issuenumber]?.id,
      },
    }),
    {}
  );
  return res.json(publishedEdges);
};
