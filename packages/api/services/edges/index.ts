import type { Namespace, Server } from "socket.io";

import type { WantedEdge } from "~dm-types/WantedEdge";
import { prismaDm } from "~prisma-clients";
import { prismaEdgeCreator } from "~prisma-clients";
import type { edgeModel } from "~prisma-clients/client_edgecreator";

import type Events from "./types";
import { namespaceEndpoint } from "./types";

const getEdges = async (filters: {
  publicationcode?: string;
  shortIssuenumbers?: string[];
  isActive?: boolean;
}) => {
  const { publicationcode, shortIssuenumbers, isActive } = filters;
  const shortIssuenumber = shortIssuenumbers
    ? {
        in: shortIssuenumbers,
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
        shortIssuenumber,
        isActive,
      },
    })
  ).reduce((acc, model) => ({ ...acc, [model.shortIssuenumber]: model }), {});

  return (
    await prismaDm.edge.findMany({
      select: {
        id: true,
        publicationcode: true,
        shortIssuenumber: true,
        shortIssuecode: true,
      },
      where: {
        publicationcode,
        shortIssuenumber,
      },
    })
  ).reduce(
    (acc, edge) => ({
      ...acc,
      [edge.shortIssuecode!]: {
        ...edge,
        modelId: edgeModels[edge.shortIssuenumber]?.id,
        v3: edgeModels[edge.shortIssuenumber] !== undefined,
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
    SELECT Count(Numero) as numberOfIssues, short_issuecode AS shortIssuecode
    FROM numeros
    WHERE NOT EXISTS(
      SELECT 1
      FROM tranches_pretes
      WHERE numeros.short_issuecode = tranches_pretes.short_issuecode
      )
    GROUP BY shortIssuenumber
    ORDER BY numberOfIssues DESC, Pays, Magazine, Numero
    LIMIT 20
  `.then(callback),
    );

    socket.on("getPublishedEdges", (callback) =>
      prismaDm.edge
        .findMany({
          select: { publicationcode: true, shortIssuenumber: true },
        })
        .then(callback),
    );

    socket.on("getEdges", async (publicationcode, shortIssuenumbers, callback) => {
      callback(await getEdges({ publicationcode, shortIssuenumbers }));
    });
  });
};
