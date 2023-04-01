import { elementImage, PrismaClient } from "~prisma_clients/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[req]: ExpressCall<{
    resBody: elementImage;
    params: { hash: string };
  }>
) =>
  await prisma.elementImage.findFirst({
    where: {
      userId: req.user!.id,
      hash: req.params.hash,
    },
  });
