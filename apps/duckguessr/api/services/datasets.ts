import { PrismaClient } from "../prisma/client_duckguessr/client";
import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import namespaces from "./namespaces";

export type DatasetsServices = NamespaceProxyTarget<
  Socket<typeof listenEvents>,
  Record<string, never>
>;

const prisma = new PrismaClient();

const listenEvents = () => ({
  getDatasets: async () => prisma.$queryRaw`
      SELECT dataset.id, name, title, description, COUNT(*) AS images, COUNT(DISTINCT personcode) AS authors
      FROM dataset
      LEFT JOIN dataset_entryurl de ON dataset.id = de.dataset_id
      LEFT JOIN entryurl_details entryurl ON de.sitecode_url = entryurl.sitecode_url
      WHERE dataset.active = 1
      AND dataset.name NOT LIKE '%-ml'
      AND decision = 'ok'
      GROUP BY dataset.name`,
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.DATASETS, {
  listenEvents,
  middlewares: [],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
