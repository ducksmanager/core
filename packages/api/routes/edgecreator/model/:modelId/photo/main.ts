import { prismaEdgeCreator } from "~/prisma";
import { elementImage } from "~prisma-clients/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: Pick<elementImage, "id" | "fileName">;
    params: { modelId: string };
  }>
) => {
  try {
    return res.json(
      await prismaEdgeCreator.elementImage.findFirstOrThrow({
        select: {
          id: true,
          fileName: true,
        },
        where: {
          tranches_en_cours_modeles_images: {
            every: {
              modelId: parseInt(req.params.modelId),
              isMainPhoto: true,
            },
          },
        },
      })
    );
  } catch (e) {
    res.writeHead(204);
    res.end();
  }
};
