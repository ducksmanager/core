import { Server } from "socket.io";

import { prismaDm } from "~/prisma";
import { prismaEdgeCreator } from "~/prisma";
import { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import { edgeModel } from "~prisma-clients/client_edgecreator";

import { Namespace } from "./types";

export default (io: Server) => {
  (io.of(Namespace['endpoint']) as Namespace).on("connection", (socket) => {
    socket.on("getEdge", async (publicationcode, issuenumbers, callback) => {
      const issuenumber =
        issuenumbers
          ? {
            in: issuenumbers
          }
          : undefined;
      const [countrycode, magazinecode] = publicationcode.split('/')
      const edgeModels: Record<string, edgeModel> = (
        await prismaEdgeCreator.edgeModel.findMany({
          where: {
            country: countrycode,
            magazine: magazinecode,
            issuenumber,
          },
        })
      ).reduce((acc, model) => ({ ...acc, [model.issuenumber]: model }), {});

      const publishedEdges: Record<string, EdgeWithModelId> = (
        await prismaDm.edge.findMany({
          select: { id: true, publicationcode: true, issuenumber: true },
          where: {
            publicationcode,
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
      callback(publishedEdges);
    })
  })
}