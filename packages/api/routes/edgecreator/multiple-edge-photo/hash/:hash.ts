import { prismaEdgeCreator } from "~/prisma";
import { elementImage } from "~prisma-clients/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req]: ExpressCall<{
    resBody: elementImage;
    params: { hash: string };
  }>
) =>
  await prismaEdgeCreator.elementImage.findFirst({
    where: {
      userId: req.user!.id,
      hash: req.params.hash,
    },
  });
