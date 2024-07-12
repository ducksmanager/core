import type { Socket } from "socket.io";

import type { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import type { SimpleEntry } from "~dm-types/SimpleEntry";
import type { SimpleIssueWithPublication } from "~dm-types/SimpleIssueWithPublication";
import { prismaCoa, prismaCoverInfo } from "~prisma-clients";
import { prismaDm } from "~prisma-clients";
import { Prisma as PrismaCoa } from "~prisma-clients/client_coa";
import type { cover } from "~prisma-clients/client_cover_info";

import { getQuotationsByShortIssuecodes } from "../quotations";
import type Events from "../types";

export default (socket: Socket<Events>) => {
  socket.on("getIssuesWithTitles", async (publicationcodes, callback) =>
    prismaCoa.inducks_issue
      .findMany({
        select: {
          publicationcode: true,
          shortIssuecode: true,
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
            (acc, { publicationcode, issuenumber, title, shortIssuecode }) => ({
              ...acc,
              [publicationcode!]: [
                ...(acc[publicationcode!] || []),
                { shortIssuecode, issuenumber: issuenumber!, title },
              ],
            }),
            {},
          ),
        );
      }),
  );

  socket.on(
    "getIssueDetails",
    async (publicationcode, issuenumber, callback) => {
      const releaseDate = (
        await prismaCoa.$queryRaw<
          {
            oldestdate: string;
          }[]
        >`
          SELECT issue.oldestdate
          FROM inducks_issue issue
          WHERE issue.publicationcode = ${publicationcode}
            AND REPLACE(issue.issuenumber, ' ', '') = ${issuenumber}`
      )[0]?.oldestdate;

      const entries = await getEntries(
        publicationcode as string,
        issuenumber as string,
      );
      callback({ releaseDate, entries });
    },
  );

  socket.on("getIssueCoverDetails", async (shortIssuecodes, callback) => {
    if (shortIssuecodes.length > 10) {
      callback({ error: "Too many requests" });
      return;
    }
    getIssueCoverDetails(shortIssuecodes, callback);
  });

  socket.on(
    "getIssueCoverDetailsByPublicationcode",
    async (publicationcode, callback) => {
      const shortIssuecodes = (
        await prismaCoa.inducks_issue.findMany({
          select: { shortIssuecode: true },
          where: { publicationcode },
        })
      ).map(({ shortIssuecode }) => shortIssuecode);
      getIssueCoverDetails(shortIssuecodes, callback);
    },
  );

  socket.on("getIssuesByShortIssuecode", async (shortIssuecodes, callback) => {
    type SimpleCover = Pick<cover, "id" | "url"> & {
      shortIssuecode: string;
    };
    const covers: { [shortIssuecode: string]: SimpleCover } = (
      await prismaCoverInfo.$queryRaw<
        Pick<SimpleCover, "id" | "url" | "shortIssuecode">[]
      >`
        SELECT id, url, short_issuecode as shortIssuecode
        FROM covers
        WHERE short_issuecode IN ${PrismaCoa.join(shortIssuecodes)}
      `
    ).groupBy("shortIssuecode");

    const issues: Parameters<typeof callback>[0] = (
      await prismaCoverInfo.$queryRaw<SimpleIssueWithPublication[]>`
      SELECT pub.countrycode, pub.publicationcode, pub.title, issue.issuenumber, issue.short_issuecode as shortIssuecode
      FROM inducks_issue issue
      INNER JOIN coa.inducks_publication pub USING(publicationcode)
      WHERE short_issuecode IN ${PrismaCoa.join(shortIssuecodes)}
    `
    )
      .filter(({ shortIssuecode }) => {
        if (!covers[shortIssuecode]) {
          console.error(
            `No COA data exists for this issue : ${shortIssuecode}`,
          );
          return false;
        }
        return true;
      })
      .map((issue) => ({
        ...issue,
        coverId: covers[issue.shortIssuecode].id,
        fullUrl: covers[issue.shortIssuecode].url,
      }))
      .groupBy("shortIssuecode");

    const popularities = await prismaDm.$queryRaw<
      { shortIssuecode: string; userCount: number }[]
    >`
      SELECT short_issuecode AS shortIssuecode, COUNT(DISTINCT ID_Utilisateur) AS userCount
      FROM numeros
      WHERE short_issuecode IN (${PrismaCoa.join(Object.values(shortIssuecodes))})
      GROUP BY short_issuecode
    `;

    for (const { shortIssuecode, userCount } of popularities) {
      issues[shortIssuecode].popularity = userCount;
    }

    const quotations = await getQuotationsByShortIssuecodes(shortIssuecodes);

    for (const shortIssuecode of Object.keys(quotations)) {
      issues[shortIssuecode].issueQuotation = quotations[shortIssuecode];
    }

    callback(issues);
  });
};

export const getCoverUrls = (shortIssuecodes: string[]) =>
  shortIssuecodes.length
    ? prismaCoa.$queryRaw<IssueCoverDetails[]>`
SELECT publicationcode,
       issuenumber,
       short_issuecode AS shortIssuecode,
       inducks_issue.title,
       CONCAT(IF(sitecode = 'thumbnails', IF (url REGEXP '^[0-9]', 'webusers/webusers', IF (url REGEXP '^webusers', 'webusers', '')), sitecode), '/', url) AS fullUrl
FROM inducks_issue
INNER JOIN inducks_entry USING (short_issuecode)
INNER JOIN inducks_entryurl  USING (entrycode)
WHERE inducks_issue.short_issuecode IN (${PrismaCoa.join(shortIssuecodes)})
  AND SUBSTR(inducks_entry.position, 0, 1) <> 'p'

GROUP BY short_issuecode`
    : Promise.resolve([]);

const getEntries = async (publicationcode: string, issuenumber: string) =>
  await prismaCoa.$queryRaw<SimpleEntry[]>`
      SELECT sv.storycode,
             sv.kind,
             sv.entirepages,
             entry.title,
             entry.part,
             CONCAT(IF(sitecode = 'thumbnails', 'webusers', sitecode), '/', url) AS url,
             entry.position
      FROM inducks_issue
               INNER JOIN inducks_entry AS entry using (short_issuecode)
               INNER JOIN inducks_storyversion AS sv using (storyversioncode)
               LEFT JOIN inducks_entryurl AS entryurl using (entrycode)
      WHERE inducks_issue.publicationcode = ${publicationcode}
        AND (REPLACE(issuenumber, ' ', '') = ${issuenumber})
      GROUP BY entry.entrycode, position
      ORDER BY position
  `;

const getIssueCoverDetails = (
  shortIssuecodes: string[],
  callback: ({ covers }: { covers: Record<string, IssueCoverDetails> }) => void,
) =>
  shortIssuecodes.length
    ? getCoverUrls(shortIssuecodes)
        .then((data) =>
          data.reduce(
            (acc, row) => ({
              ...acc,
              [row.issuenumber]: row,
            }),
            {} as Record<string, IssueCoverDetails>,
          ),
        )
        .then((data) => {
          callback({ covers: data });
        })
    : callback({ covers: {} });
