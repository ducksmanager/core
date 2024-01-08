import { Socket } from "socket.io";

import { prismaCoa, prismaCoverInfo, prismaDm } from "~/prisma";
import { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import { SimpleEntry } from "~dm-types/SimpleEntry";
import { SimpleIssueWithPublication } from "~dm-types/SimpleIssueWithPublication";
import { Prisma as PrismaCoa } from "~prisma-clients/client_coa";
import { cover } from "~prisma-clients/client_cover_info";

import Services from "../types";
export default (socket: Socket<Services>) => {
  socket.on("getIssuesWithTitles", async (publicationcode, callback) =>
    prismaCoa.inducks_issue
      .findMany({
        select: {
          issuenumber: true,
          title: true,
        },
        where: {
          publicationcode,
        },
      })
      .then((data) => {
        callback(
          data.map(({ issuenumber, title }) => ({
            issuenumber: issuenumber!.replace(/ +/g, " "),
            title,
          }))
        );
      })
  );

  socket.on(
    "getIssueDetails",
    async (publicationcode, issuenumber, callback) => {
      const releaseDate = (
        (await prismaCoa.$queryRaw`
          SELECT issue.oldestdate
          FROM inducks_issue issue
          WHERE issue.publicationcode = ${publicationcode}
            AND REPLACE(issue.issuenumber, ' ', '') = ${issuenumber}`) as {
          oldestdate: string;
        }[]
      )[0]?.oldestdate;

      const entries = await getEntries(
        publicationcode as string,
        issuenumber as string
      );
      callback({ releaseDate, entries });
    }
  );

  socket.on("getIssueCoverDetails", async (publicationCodes, callback) => {
    if (publicationCodes.length > 10) {
      callback({ error: "Too many requests" });
      return;
    }
    callback(
      { covers:(
        (await prismaCoa.$queryRaw`
          SELECT publicationcode,
                 issuenumber,
                 title,
                 (SELECT CONCAT(IF(sitecode = 'thumbnails', 'webusers', sitecode), '/', url) AS coverUrl
                  FROM inducks_entry
                           INNER JOIN inducks_entryurl ON inducks_entry.entrycode = inducks_entryurl.entrycode
                  WHERE inducks_entry.issuecode = inducks_issue.issuecode
                    AND SUBSTR(inducks_entry.position, 0, 1) <> 'p'
                  LIMIT 1) AS coverUrl
          FROM inducks_issue
          WHERE inducks_issue.publicationcode IN(${PrismaCoa.join(
            publicationCodes
          )})`) as IssueCoverDetails[]
      ).reduce(
        (acc, row) => ({
          ...acc,
          [row.issuenumber.replace(/ +/g, " ")]: row,
        }),
        {} as Record<string, IssueCoverDetails>
      )
      });
  });

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
      (await prismaCoa.$queryRaw`
      SELECT pub.countrycode, pub.publicationcode, pub.title, issue.issuenumber, issue.issuecode
      FROM inducks_issue issue
      INNER JOIN coa.inducks_publication pub USING(publicationcode)
      WHERE issue.issuecode IN ${PrismaCoa.join(issueCodes)}
    `) as SimpleIssueWithPublication[]
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
        issuenumber: issue.issuenumber.replace(/ +/g, " "),
        coverId: covers[issue.issuecode].id,
        coverUrl: covers[issue.issuecode].url,
      }))
      .groupBy("issuecode");

    const longIssueCodes = Object.keys(issues);
    const shortIssueCodes = longIssueCodes.reduce(
      (acc, longIssueCode) => ({
        [longIssueCode]: longIssueCode.replace(/ +/g, " "),
      }),
      {}
    );

    // const quotations = await getIssueQuotations(issueCodes);

    const popularities = (await prismaDm.$queryRaw`
      SELECT issuecode, COUNT(DISTINCT ID_Utilisateur) AS userCount
      FROM numeros
      WHERE issuecode IN (${PrismaCoa.join(Object.values(shortIssueCodes))})
      GROUP BY issuecode
    `) as { issuecode: string; userCount: number }[];

    for (const { issuecode, userCount } of popularities) {
      const longIssueCode: string = Object.entries(shortIssueCodes).find(
        ([, shortIssueCode]) => shortIssueCode === issuecode
      )![0];
      issues[longIssueCode].popularity = userCount;
    }

    callback(issues);
  });
};
type ReturnType<FieldValue, T> = FieldValue extends string ? never : T;

declare global {
  interface Array<T> {
    groupBy<FieldValue>(
      fieldName: string,
      valueFieldName?: FieldValue
    ): { [key: string]: ReturnType<FieldValue, T> };
  }
}

Array.prototype.groupBy = function (fieldName, valueFieldName?) {
  return this.reduce(
    (acc, object) => ({
      ...acc,
      [object[fieldName]]: valueFieldName
        ? object[valueFieldName] || undefined
        : object,
    }),
    {}
  );
};

const getEntries = async (
  publicationcode: string,
  issuenumber: string
): Promise<SimpleEntry[]> =>
  await prismaCoa.$queryRaw`
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
