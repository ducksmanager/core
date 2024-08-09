import type { Socket } from "socket.io";

import type { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import type { SimpleEntry } from "~dm-types/SimpleEntry";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
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

export const getCoverUrls = async (issuecodes: string[]) => {
  debugger
  const issues = (await prismaCoa.inducks_issue.findMany({
    select: {
      issuecode: true,
      title: true,
    },
    where: {
      issuecode: {
        in: issuecodes,
      },
    },
  })).groupBy("issuecode");
  const entrycodeByIssuecode = (await prismaCoa.inducks_entry.findMany({
    select: {
      entrycode: true,
      issuecode: true,
    },
    where: {
      issuecode: {
        in: issuecodes,
      },
      position: {
        not: {
          startsWith: "p",
        },
      },
    },
    orderBy: [{
      position: "desc",
    }],
  })).groupBy("issuecode", 'entrycode');
  const entryurls = (await prismaCoa.inducks_entryurl.findMany({
    select: {
      entrycode: true,
      sitecode: true,
      url: true,
    },
    where: {
      entrycode: {
        in: Object.values(entrycodeByIssuecode).map((entrycode) => entrycode),
      },
    },
  })).groupBy("entrycode");

  return Object.entries(issues).map(([issuecode, issue]) => {
    const coverEntryUrl = entryurls[entrycodeByIssuecode[issuecode]]
    if (!coverEntryUrl) {
      return {
        issuecode,
        title: issue.title!,
        fullUrl: null,
      }
    }

    const urlPrefix = (
      /^\d/.test(coverEntryUrl.url!) ? 'webusers/webusers' : coverEntryUrl.url!.startsWith('webusers') ? 'webusers' : coverEntryUrl.sitecode);
    return {
      issuecode,
      title: issue.title!,
      fullUrl: `${urlPrefix}/${coverEntryUrl.url}`,
    };
  });
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
) => getCoverUrls(issuecodes)
  .then((data) => data.groupBy("issuecode"))
  .then((data) => {
    callback({ covers: data });
  });
