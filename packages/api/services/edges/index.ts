import { Namespace, Server } from "socket.io";

import { prismaDm } from "~/prisma";
import { prismaEdgeCreator } from "~/prisma";
import { EdgeWithModelId } from "~dm-types/EdgeWithModelId";
import { WantedEdge } from "~dm-types/WantedEdge";
import { edgeModel } from "~prisma-clients/client_edgecreator";

import Events from "./types";

export default (io: Server) => {
  (io.of(Events.namespaceEndpoint) as Namespace<Events>).on(
    "connection",
    (socket) => {
      console.log("connected to edges");

      socket.on("getWantedEdges", (callback) =>
        prismaDm.$queryRaw<WantedEdge[]>`
    SELECT Count(Numero) as numberOfIssues, CONCAT(Pays, '/', Magazine) AS publicationcode, Numero AS issuenumber
    FROM numeros
    WHERE NOT EXISTS(
      SELECT 1
      FROM tranches_pretes
      WHERE CONCAT(numeros.Pays, '/', numeros.Magazine) = tranches_pretes.publicationcode
        AND numeros.Numero_nospace = tranches_pretes.issuenumber
      )
    GROUP BY Pays, Magazine, Numero
    ORDER BY numberOfIssues DESC, Pays, Magazine, Numero
    LIMIT 20
  `.then(callback)
      );

      socket.on("getPublishedEdges", (callback) =>
        prismaDm.edge
          .findMany({
            select: { publicationcode: true, issuenumber: true },
          })
          .then(callback)
      );

      socket.on("getEdge", async (publicationcode, issuenumbers, callback) => {
        const issuenumber = issuenumbers
          ? {
              in: issuenumbers,
            }
          : undefined;
        const [countrycode, magazinecode] = publicationcode.split("/");
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
      });
    }
  );
};
