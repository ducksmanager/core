import type { Socket } from "socket.io";

import type { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import type { SimpleEntry } from "~dm-types/SimpleEntry";
import type { SimpleIssueWithPublication } from "~dm-types/SimpleIssueWithPublication";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import type { cover } from "~prisma-schemas/schemas/cover_info";
import { prismaClient as prismaCoverInfo } from "~prisma-schemas/schemas/cover_info/client";
import { Prisma } from "~prisma-schemas/schemas/dm";
import {  prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { getQuotationsByissuesByIssuecodes } from "../quotations";
import type Events from "../types";

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

  socket.on("getissuesByIssuecode", async (issuecodes, callback) => {
    type SimpleCover = Pick<cover, "id" | "url"> & {
      issuecode: string;
    };
    const covers: { [issuecode: string]: SimpleCover } = (
      await prismaCoverInfo.$queryRaw<
        Pick<SimpleCover, "id" | "url" | "issuecode">[]
      >`
        SELECT id, url, issuecode
        FROM covers
        WHERE issuecode IN ${Prisma.join(issuecodes)}
      `
    ).groupBy("issuecode");

    const issues: Parameters<typeof callback>[0] = (
      await prismaCoverInfo.$queryRaw<SimpleIssueWithPublication[]>`
      SELECT pub.countrycode, pub.publicationcode, pub.title, issue.issuenumber, issue.issuecode
      FROM inducks_issue issue
      INNER JOIN coa.inducks_publication pub USING(publicationcode)
      WHERE issue.issuecode IN ${Prisma.join(issuecodes)}
    `
    )
      .filter(({ issuecode }) => {
        if (!covers[issuecode]) {
          console.error(`No COA data exists for this issue : ${issuecode}`);
          return false;
        }
        return true;
      })
      .map((issue) => ({
        ...issue,
        coverId: covers[issue.issuecode].id,
        fullUrl: covers[issue.issuecode].url,
      }))
      .groupBy("issuecode");

    const popularities = await prismaDm.$queryRaw<
      { issuecode: string; userCount: number }[]
    >`
      SELECT issuecode, COUNT(DISTINCT ID_Utilisateur) AS userCount
      FROM numeros
      WHERE issuecode IN (${Prisma.join(Object.values(issuecodes))})
      GROUP BY issuecode
    `;

    for (const { issuecode, userCount } of popularities) {
      issues[issuecode].popularity = userCount;
    }

    const quotations = await getQuotationsByissuesByIssuecodes(issuecodes);

    for (const issuecode of Object.keys(quotations)) {
      issues[issuecode].issueQuotation = quotations[issuecode];
    }

    callback(issues);
  });
};

export const getCoverUrls = (issuecodes: string[]) =>
  issuecodes.length
    ? prismaCoa.$queryRaw<IssueCoverDetails[]>`
SELECT publicationcode,
       issuenumber,
       inducks_issue.issuecode,
       inducks_issue.title,
       CONCAT(IF(sitecode = 'thumbnails', IF (url REGEXP '^[0-9]', 'webusers/webusers', IF (url REGEXP '^webusers', 'webusers', '')), sitecode), '/', url) AS fullUrl
FROM inducks_issue
INNER JOIN inducks_entry USING (issuecode)
INNER JOIN inducks_entryurl  USING (entrycode)
WHERE inducks_issue.issuecode IN (${Prisma.join(issuecodes)})
  AND SUBSTR(inducks_entry.position, 0, 1) <> 'p'

GROUP BY issuecode`
    : Promise.resolve([]);

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
  issuecodes.length
    ? getCoverUrls(issuecodes)
        .then((data) =>
          data.reduce<Record<string, IssueCoverDetails>>(
            (acc, row) => ({
              ...acc,
              [row.issuenumber]: row,
            }),
            {},
          ),
        )
        .then((data) => {
          callback({ covers: data });
        })
    : callback({ covers: {} });
