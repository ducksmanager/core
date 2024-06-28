import type { Socket } from "socket.io";

import type { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import type { SimpleEntry } from "~dm-types/SimpleEntry";
import type { SimpleIssueWithPublication } from "~dm-types/SimpleIssueWithPublication";
import { prismaCoa, prismaCoverInfo } from "~prisma-clients";
import { prismaDm } from "~prisma-clients";
import { Prisma as PrismaCoa } from "~prisma-clients/client_coa";
import type { cover } from "~prisma-clients/client_cover_info";

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
                { issuecode, issuenumber: issuenumber!, title },
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
        await prismaCoa.inducks_issue.findMany({ where: { publicationcode } })
      ).map((issue) => issue.issuecode);
      getIssueCoverDetails(issuecodes, callback);
    },
  );

  socket.on("getIssuesByCode", async (issueCodes, callback) => {
    const covers: { [issuecode: string]: cover } = (
      await prismaCoverInfo.cover.findMany({
        where: {
          issuecode: {
            in: issueCodes,
          },
        },
      })
    ).groupBy("issuecode");

    const issues = (
      await prismaCoa.$queryRaw<SimpleIssueWithPublication[]>`
      SELECT pub.countrycode, pub.publicationcode, pub.title, issue.issuenumber, issue.issuecode
      FROM inducks_issue issue
      INNER JOIN coa.inducks_publication pub USING(publicationcode)
      WHERE issue.issuecode IN ${PrismaCoa.join(issueCodes)}
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

    const longIssueCodes = Object.keys(issues);
    const shortIssueCodes = longIssueCodes.reduce(
      (acc, longIssueCode) => ({
        ...acc,
        [longIssueCode]: longIssueCode,
      }),
      {},
    );

    // const quotations = await getIssueQuotations(issueCodes);

    const popularities = await prismaDm.$queryRaw<
      { issuecode: string; userCount: number }[]
    >`
      SELECT issuecode, COUNT(DISTINCT ID_Utilisateur) AS userCount
      FROM numeros
      WHERE issuecode IN (${PrismaCoa.join(Object.values(shortIssueCodes))})
      GROUP BY issuecode
    `;

    for (const { issuecode, userCount } of popularities) {
      const longIssueCode: string = Object.entries(shortIssueCodes).find(
        ([, shortIssueCode]) => shortIssueCode === issuecode,
      )![0];
      issues[longIssueCode].popularity = userCount;
    }

    callback(issues);
  });
};

export const getCoverUrls = (issuecodes: string[]) =>
  issuecodes.length
    ? prismaCoa.$queryRaw<IssueCoverDetails[]>`
SELECT publicationcode,
       issuecode,
       issuenumber,
       title,
       (SELECT CONCAT(IF(sitecode = 'thumbnails', IF (url REGEXP '^[0-9]', 'webusers/webusers', ''), sitecode), '/', url) AS fullUrl
        FROM inducks_entry
                 INNER JOIN inducks_entryurl ON inducks_entry.entrycode = inducks_entryurl.entrycode
        WHERE inducks_entry.issuecode = inducks_issue.issuecode
          AND SUBSTR(inducks_entry.position, 0, 1) <> 'p'
        LIMIT 1) AS fullUrl
FROM inducks_issue
WHERE inducks_issue.issuecode IN(${PrismaCoa.join(issuecodes)})`
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
               INNER JOIN inducks_entry AS entry using (issuecode)
               INNER JOIN inducks_storyversion AS sv using (storyversioncode)
               LEFT JOIN inducks_entryurl AS entryurl using (entrycode)
      WHERE inducks_issue.publicationcode = ${publicationcode}
        AND (REPLACE(issuenumber, ' ', '') = ${issuenumber})
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
