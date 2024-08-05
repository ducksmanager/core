import type { Socket } from "socket.io";

import type { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import type { SimpleEntry } from "~dm-types/SimpleEntry";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { Prisma } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { augmentIssueArrayWithInducksData } from "..";
import { getQuotationsByIssuecodes } from "../quotations";
import type Events from "../types";

export const getPopularityByIssuecodes = async (issuecodes: string[]) =>
  Object.entries(
    await prismaDm.issue.groupBy({
      by: ["issuecode", "userId"],
      where: {
        issuecode: {
          in: issuecodes,
        },
      },
      _sum: {
        id: true,
      },
    }),
  ).reduce<Record<string, { popularity: number }>>(
    (acc, [issuecode, { _sum }]) => ({
      ...acc,
      [issuecode]: { popularity: _sum.id || 0 },
    }),
    {},
  );

export default (socket: Socket<Events>) => {
  socket.on("getIssuesWithTitles", async (publicationcodes, callback) =>
    prismaCoa.inducks_issue
      .findMany({
        select: {
          publicationcode: true,
          issuecode: true,
          issuenumber: true,
          title: true,
        },
        where: {
          publicationcode: {
            in: publicationcodes,
          },
        },
      })
      .then((data) => {
        callback(
          data.reduce<Parameters<typeof callback>[0]>(
            (acc, { publicationcode, issuenumber, title, issuecode }) => ({
              ...acc,
              [publicationcode!]: [
                ...(acc[publicationcode!] || []),
                {
                  issuecode,
                  publicationcode: publicationcode!,
                  issuenumber: issuenumber!,
                  title,
                },
              ],
            }),
            {},
          ),
        );
      }),
  );

  socket.on("getIssueDetails", async (issuecode, callback) => {
    const entries = await getEntries(issuecode);
    callback({
      releaseDate: (
        await prismaCoa.inducks_issue.findFirstOrThrow({
          where: { issuecode },
        })
      ).oldestdate!,
      entries,
    });
  });

  socket.on("getIssueCoverDetails", async (issuecodes, callback) => {
    if (issuecodes.length > 10) {
      callback({ error: "Too many requests" });
      return;
    }
    getIssueCoverDetails(issuecodes, callback);
  });

  socket.on(
    "getIssueCoverDetailsByPublicationcode",
    async (publicationcode, callback) => {
      const issuecodes = (
        await prismaCoa.inducks_issue.findMany({
          select: { issuecode: true },
          where: { publicationcode },
        })
      ).map(({ issuecode }) => issuecode);
      getIssueCoverDetails(issuecodes, callback);
    },
  );

  socket.on("getIssuesByIssuecode", async (issuecodes, callback) => {
    const coversByIssuecode = await getCoverUrls(issuecodes)
      .then((coverUrls) =>
        coverUrls.map(({ issuecode, fullUrl }) => ({
          issuecode,
          fullUrl,
        })),
      )
      .then(augmentIssueArrayWithInducksData)
      .then((covers) => covers.groupBy("issuecode"))

    const popularitiesByIssuecode = await getPopularityByIssuecodes(issuecodes);

    const quotationsByIssuecode = await getQuotationsByIssuecodes(issuecodes);

    callback({
      covers: Object.values(
        Object.assign(
          coversByIssuecode,
          quotationsByIssuecode,
          popularitiesByIssuecode,
        ),
      ),
    });
  });
};

export const getCoverUrls = (issuecodes: string[]) =>
  {
    // const a = ["fi/AATT 21"]
    console.log(`
        SELECT inducks_issue.issuecode,
              inducks_issue.title,
              CONCAT(IF(sitecode = 'thumbnails', IF (url REGEXP '^[0-9]', 'webusers/webusers', IF (url REGEXP '^webusers', 'webusers', '')), sitecode), '/', url) AS fullUrl
        FROM inducks_issue
        INNER JOIN inducks_entry USING (issuecode)
        INNER JOIN inducks_entryurl  USING (entrycode)
        WHERE inducks_issue.issuecode IN (${Prisma.join(issuecodes)})
          AND SUBSTR(inducks_entry.position, 0, 1) <> 'p'

        GROUP BY issuecode`)
    return issuecodes.length
      ? prismaCoa.$queryRaw<IssueCoverDetails[]>`
        SELECT inducks_issue.issuecode,
              inducks_issue.title,
              CONCAT(IF(sitecode = 'thumbnails', IF (url REGEXP '^[0-9]', 'webusers/webusers', IF (url REGEXP '^webusers', 'webusers', '')), sitecode), '/', url) AS fullUrl
        FROM inducks_issue
        INNER JOIN inducks_entry USING (issuecode)
        INNER JOIN inducks_entryurl  USING (entrycode)
        WHERE inducks_issue.issuecode IN (${Prisma.join(issuecodes)})
          AND SUBSTR(inducks_entry.position, 0, 1) <> 'p'

        GROUP BY issuecode`
      : Promise.resolve([]);
  };

const getEntries = async (issuecode: string) =>
  await prismaCoa.$queryRaw<SimpleEntry[]>`
      SELECT sv.storycode,
             sv.kind,
             sv.entirepages,
             entry.title,
             entry.part,
             CONCAT(IF(sitecode = 'thumbnails', 'webusers', sitecode), '/', url) AS url,
             entry.position
      FROM inducks_issue
               INNER JOIN inducks_entry AS entry using (issuecode)
               INNER JOIN inducks_storyversion AS sv using (storyversioncode)
               LEFT JOIN inducks_entryurl AS entryurl using (entrycode)
      WHERE inducks_issue.issuecode = ${issuecode}
      GROUP BY entry.entrycode, position
      ORDER BY position
  `;

const getIssueCoverDetails = (
  issuecodes: string[],
  callback: ({ covers }: { covers: Record<string, IssueCoverDetails> }) => void,
) =>
  {
    console.log(issuecodes)
    return getCoverUrls(issuecodes)
      .then((data) => {

    console.log(data)
        return data.groupBy("issuecode");
      })
      .then((data) => {
        callback({ covers: data });
      });
  };
