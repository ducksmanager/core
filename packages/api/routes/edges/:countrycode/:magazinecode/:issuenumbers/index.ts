import { prismaDm, prismaEdgeCreator } from "~/prisma";
import { edgeModel } from "~prisma_clients/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";
import { EdgeWithModelId } from "~types/EdgeWithModelId";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: Record<string, EdgeWithModelId>;
    params: {
      countrycode: string;
      magazinecode: string;
      issuenumbers?: string;
    };
  }>
) => {
  const issuenumber =
    (req.params.issuenumbers || "_") !== "_"
      ? {
          in: req.params.issuenumbers!.split(","),
        }
      : undefined;
  const edgeModels: Record<string, edgeModel> = (
    await prismaEdgeCreator.edgeModel.findMany({
      where: {
        country: req.params.countrycode,
        magazine: req.params.magazinecode,
        issuenumber,
      },
    })
  ).reduce((acc, model) => ({ ...acc, [model.issuenumber]: model }), {});

  const publishedEdges = (
    await prismaDm.edge.findMany({
      select: { id: true, publicationcode: true, issuenumber: true },
      where: {
        publicationcode: `${req.params.countrycode}/${req.params.magazinecode}`,
        issuenumber,
      },
    })
  ).reduce(
    (acc, edge) => ({
      ...acc,
      [edge.issuenumber]: {
        ...edge,
        modelId: edgeModels[edge.issuenumber]?.id,
        v3: edgeModels[edge.issuenumber] !== undefined,
      },
    }),
    {}
  );
  return res.json(publishedEdges);
};
