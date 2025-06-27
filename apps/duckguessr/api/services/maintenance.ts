import type { entryurlDetailsDecision } from "prisma/client_duckguessr";
import { PrismaClient } from "prisma/client_duckguessr";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";
import type { Socket } from "socket.io";
import namespaces from "./namespaces";

export type MaintenanceServices = NamespaceProxyTarget<
  Socket<typeof listenEvents>,
  Record<string, never>
>;

const prisma = new PrismaClient();

const listenEvents = ({}: MaintenanceServices) => ({
  getMaintenanceData: async () => prisma.$queryRaw`
              select name, decision, count(*) as 'count'
              from dataset
              left join dataset_entryurl de on dataset.id = de.dataset_id
              left join entryurl_details using (sitecode_url)
              group by dataset_id, decision
            `,

  getMaintenanceDataForDataset: async (
    datasetName: string,
    decisions: (entryurlDetailsDecision | "null")[],
    offset: number,
  ) => {
    if (!decisions) {
      throw new Error("No decisions provided");
    }
    const dataset = await prisma.dataset.findUnique({
      where: {
        name: datasetName,
      },
    });
    if (!dataset) {
      throw new Error("No dataset exists with name " + datasetName);
    }
    return await prisma.datasetEntryurl.findMany({
      where: {
        OR: decisions.map((decision) => ({
          datasetId: dataset.id,
          entryurlDetails: {
            is: {
              decision: decision === "null" ? null : decision,
            },
          },
        })),
      },
      include: {
        dataset: true,
        entryurlDetails: true,
      },
      take: 60,
      skip: offset,
      orderBy: {
        sitecodeUrl: "asc",
      },
    });
  },
  updateMaintenanceData: async (
    data: { sitecodeUrl: string; decision: entryurlDetailsDecision }[],
  ) =>
    prisma.$transaction(
      data.map(({ sitecodeUrl, decision }) =>
        prisma.entryurlDetails.update({
          where: {
            sitecodeUrl,
          },
          data: {
            decision,
            updatedAt: new Date(),
          },
        }),
      ),
    ),
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.MAINTENANCE, {
  listenEvents,
  middlewares: [],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
