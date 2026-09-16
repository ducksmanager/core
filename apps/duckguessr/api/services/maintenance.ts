import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";
import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

import prisma from "../prisma/client";
import { entryurlDetailsDecision } from "../prisma/client_duckguessr/browser";
import namespaces from "./namespaces";
import { RequiredPlayerMiddleware } from "../middlewares/required-player";

export type MaintenanceServices = NamespaceProxyTarget<
  Socket<typeof listenEvents>,
  Record<string, never>
>;

const listenEvents = () => ({
  getMaintenanceData: async () => prisma.$queryRaw<
    { name: string; decision: string; count: number }[]
  >`
              select name, decision, count(*) as 'count'
              from dataset
              left join dataset_entryurl de on dataset.id = de.dataset_id
              left join entryurl_details using (sitecode_url)
              group by dataset_id, decision
            `,

  getMaintenanceDataForDataset: ev(
    v.pipe(v.string()),
    v.pipe(v.array(v.enum({ ...entryurlDetailsDecision, null: "null" }))),
    v.pipe(v.number()),
  )(async (datasetName, decisions, offset) => {
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
  }),
  updateMaintenanceData: ev(
    v.pipe(
      v.array(
        v.object({
          sitecodeUrl: v.string(),
          decision: v.enum(entryurlDetailsDecision),
        }),
      ),
    ),
  )(async (data) =>
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
  ),
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.MAINTENANCE, {
  listenEvents,
  middlewares: [RequiredPlayerMiddleware],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
