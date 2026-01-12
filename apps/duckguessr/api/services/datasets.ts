import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { Prisma } from "~prisma-schemas/client_dm/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa";

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
  }) => {
    const errors: string[] = [];
    if (personNationalityFilter && !personNationalityFilter.length) {
      errors.push(
        "At least one nationality is required when using the nationality filter",
      );
    }
    if (errors.length) {
      return {
        errors,
        datasetSize: 0,
      } as const;
    }
    return prismaCoa.$queryRaw<
      [
        {
          datasetSize: number;
          samples: string;
          authors: string;
        },
      ]
    >`
      with dataset as (select sitecode, url, REPLACE(artsummary, ',', '') as personcode
      from inducks_entryurl
         inner join inducks_entry using (entrycode)
         inner join inducks_storyversion using (storyversioncode)
      where sitecode = 'thumbnails3'
        and kind = 'n'
        ${
          personNationalityFilter && personNationalityFilter.length > 0
            ? Prisma.sql`and artsummary in (select concat(',', personcode, ',') from inducks_person where nationalitycountrycode in (${Prisma.join(personNationalityFilter)}))`
            : Prisma.empty
        }
      ),
      author_counts as (
        select personcode, count(*) as count
        from dataset
        group by personcode
      ),
      dataset_stats as (
        select count(*) as datasetSize,
        IFNULL(json_arrayagg(
          json_object('url', CONCAT(sitecode, '/', url), 'personcode', personcode) LIMIT 50
        ), '[]') as samples
        from dataset),
      author_counts_ordered as (
        select personcode, count, row_number() over (order by count desc) as rn
        from author_counts
      ),
      authors_list as (
        select IFNULL(json_objectagg(personcode, count), '{}') as authors
        from author_counts_ordered
      )
      select datasetSize, samples, authors
      from dataset_stats, authors_list
      `.then(
      ([result]) =>
        ({
          datasetSize: result.datasetSize,
          authors: JSON.parse(result.authors),
          samples: JSON.parse(result.samples),
        }) as {
          datasetSize: number;
          samples: { url: string; personcode: string }[];
          authors: Record<string, number>;
        },
    );
  },
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
