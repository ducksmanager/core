import { useSocketEvents } from "socket-call-server";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaEdgeCreator } from "~prisma-schemas/schemas/edgecreator/client";

import namespaces from "../namespaces";

const getEdges = async (filters: {
  publicationcode?: string;
  issuecodes?: string[];
}) => {
  if (!(filters.publicationcode || filters.issuecodes)) {
    throw new Error("Invalid filter");
  }
  const issuecode = {
    in:
      filters.issuecodes ||
      (
        await prismaCoa.inducks_issue.findMany({
          select: { issuecode: true },
          where: {
            publicationcode: filters.publicationcode,
          },
        })
      ).map(({ issuecode }) => issuecode),
  };
  const edgeModels = (
    await prismaEdgeCreator.edgeModel.findMany({
      where: {
        issuecode,
      },
    })
  ).groupBy("issuecode");

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
  getWantedEdges: () =>
    prismaDm.$queryRaw<{ numberOfIssues: number; issuecode: string }[]>`
    SELECT Count(Numero) as numberOfIssues, issuecode
    FROM numeros AS issue
    WHERE issuecode IS NOT NULL AND NOT EXISTS(
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

  getEdges: (filters: { publicationcode?: string; issuecodes?: string[] }) =>
    getEdges(filters)
      .then((edges) => prismaCoa.augmentIssueArrayWithInducksData(edges))
      .then((edges) => edges.groupBy("issuecode")),
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.EDGES,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
