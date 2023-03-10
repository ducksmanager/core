import { PrismaClient as PrismaClientDm } from "~/dist/prisma/client_dm";
import {
  edgeModel,
  PrismaClient as PrismaClientEdgeCreator,
} from "~/dist/prisma/client_edgecreator";
import { ExpressCall } from "~routes/_express-call";

const prismaDm = new PrismaClientDm();
const prismaEdgeCreator = new PrismaClientEdgeCreator();

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: edgeModel;
    params: { countrycode: string; magazinecode: string; issuenumber: string };
  }>
) => {
  const {
    countrycode: country,
    magazinecode: magazine,
    issuenumber,
  } = req.params;
  const publicationcode = `${country}/${magazine}`;
  const model = await prismaEdgeCreator.edgeModel.findFirst({
    where: {
      country,
      magazine,
      issuenumber,
    },
  });
  const modelIsPublished =
    (await prismaDm.edge.count({
      where: {
        publicationcode,
        issuenumber,
      },
    })) > 0;
  if (model && modelIsPublished) {
    return res.json(model);
  }
  res.writeHead(204);
  res.end();
};
