import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { Prisma } from "~prisma-schemas/client_dm/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import prisma from "../prisma/client";
import namespaces from "./namespaces";

export type DatasetsServices = NamespaceProxyTarget<
  Socket<typeof listenEvents>,
  Record<string, never>
>;

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

  previewDataset: async ({
    personNationalityFilter,
    oldestDateFilterMin,
    oldestDateFilterMax,
  }: {
    personNationalityFilter: string[] | undefined;
    oldestDateFilterMin: number | undefined;
    oldestDateFilterMax: number | undefined;
  }) =>
    prismaCoa.$queryRaw<{ datasetSize: number; matches: string | null }[]>`
      with dataset as (select sitecode, url, REPLACE(artsummary, ',', '') as personcode
      from inducks_entryurl
         inner join inducks_entry using (entrycode)
         inner join inducks_storyversion using (storyversioncode)
      where sitecode = 'thumbnails3'
        and kind = 'n'
        and (${personNationalityFilter?.join(",") || null} IS NULL OR (${personNationalityFilter?.join(",") || null} IS NOT NULL AND artsummary in (select concat(',', personcode, ',') from inducks_person where nationalitycountrycode in (${Prisma.join(personNationalityFilter || ["xxx"])} ))))
      )
      select count(*) as datasetSize, group_concat(CONCAT(sitecode, '/',url, '|', personcode) LIMIT 50) as matches
      from dataset
      `.then(([{ datasetSize, matches }]) => ({
      datasetSize,
      matches: (matches?.split(",") || []).map((urlAndPersoncode) => {
        const [url, personcode] = urlAndPersoncode.split("|");
        return { url, personcode };
      }),
    })),
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
