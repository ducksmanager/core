import type { Namespace, Server } from "socket.io";

import type { WantedEdge } from "~dm-types/WantedEdge";
import { prismaDm } from "~prisma-clients";
import { prismaEdgeCreator } from "~prisma-clients";
import type { edgeModel } from "~prisma-clients/client_edgecreator";

import type Events from "./types";
import { namespaceEndpoint } from "./types";

const getEdges = async (filters: {
  publicationcode?: string;
  issuenumbers?: string[];
  isActive?: boolean;
}) => {
  const { publicationcode, issuenumbers, isActive } = filters;
  const issuenumber = issuenumbers
    ? {
        in: issuenumbers,
      }
    : undefined;
  const [countrycode, magazinecode] = publicationcode
    ? publicationcode.split("/")
    : [undefined, undefined];
  const edgeModels: Record<string, edgeModel> = (
    await prismaEdgeCreator.edgeModel.findMany({
      where: {
        country: countrycode,
        magazine: magazinecode,
        issuenumber,
        isActive,
      },
    })
  ).reduce((acc, model) => ({ ...acc, [model.issuenumber]: model }), {});

  return (
    await prismaDm.edge.findMany({
      select: {
        id: true,
        publicationcode: true,
        issuenumber: true,
        issuecode: true,
      },
      where: {
        publicationcode,
        issuenumber,
      },
    })
  ).reduce(
    (acc, edge) => ({
      ...acc,
      [edge.issuecode!]: {
        ...edge,
        modelId: edgeModels[edge.issuenumber]?.id,
        v3: edgeModels[edge.issuenumber] !== undefined,
      },
    }),
    {},
  );
};

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
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
  `.then(callback),
    );

    socket.on("getPublishedEdges", (callback) =>
      prismaDm.edge
        .findMany({
          select: { publicationcode: true, issuenumber: true },
        })
        .then(callback),
    );

    socket.on("getEdges", async (publicationcode, issuenumbers, callback) => {
      callback(await getEdges({ publicationcode, issuenumbers }));
    });
  });
};
