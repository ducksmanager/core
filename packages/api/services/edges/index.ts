import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import type { edgeModel } from "~prisma-schemas/schemas/edgecreator";
import { prismaClient as prismaEdgeCreator } from "~prisma-schemas/schemas/edgecreator/client";
import { useSocketServices } from "~socket.io-services";

const getEdges = async (filters: {
  publicationcode?: string;
  issuecodes?: string[];
}) => {
  if (!filters.publicationcode || !filters.issuecodes) {
    throw new Error("Invalid filter");
  }
  const issuecode = filters.issuecodes
    ? {
        in: filters.issuecodes,
      }
    : undefined;
  const edgeModels: Record<string, edgeModel> = (
    await prismaEdgeCreator.edgeModel.findMany({
      where: {
        issuecode,
      },
    })
  ).reduce(
    (acc, model) => {
      acc[model.issuecode] = model;
      return acc;
    },
    {} as Record<string, edgeModel>,
  );

  return (
    await prismaDm.edge.findMany({
      select: {
        id: true,
        issuecode: true,
      },
      where: {
        issuecode,
      },
    })
  ).map((edge) => ({
    ...edge,
    modelId: edgeModels[edge.issuecode]?.id,
    v3: !!edgeModels[edge.issuecode],
  }));
};

const listenEvents = () => ({
  getWantedEdges: async () =>
    prismaDm.$queryRaw<{ numberOfIssues: number; issuecode: string }[]>`
    SELECT Count(Numero) as numberOfIssues, issuecode
    FROM numeros AS issue
    WHERE NOT EXISTS(
      SELECT 1
      FROM tranches_pretes
      WHERE issue.issuecode = tranches_pretes.issuecode
      )
    GROUP BY issuecode
    ORDER BY numberOfIssues DESC, issuecode
    LIMIT 20
  `.then((issues) => prismaCoa.augmentIssueArrayWithInducksData(issues)),

  getPublishedEdges: () =>
    prismaDm.edge
      .findMany({
        select: { issuecode: true },
      })
      .then((issues) => prismaCoa.augmentIssueArrayWithInducksData(issues)),

  getEdges: async (filters: { publicationcode?: string; issuecodes?: string[] }) =>
    getEdges(filters)
      .then((edges) => prismaCoa.augmentIssueArrayWithInducksData(edges))
      .then((edges) => edges.groupBy("issuecode")),
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents
>("/events", {
  listenEvents,
  middlewares: [],
});
