import type { SimpleEntry } from "~dm-types/SimpleEntry";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

export const getPopularityByIssuecodes = async (issuecodes: string[]) =>
  prismaDm.issue
    .groupBy({
      by: ["issuecode"],
      where: {
        issuecode: {
          in: issuecodes,
        },
      },
      _count: {
        id: true,
      },
    })
    .then((data) =>
      data.map(({ issuecode, _count }) => ({
        issuecode,
        popularity: _count.id,
      })),
    )
    .then((data) => data.groupBy("issuecode"));

export default {
  getIssueDetails: async (issuecode: string) => {
    const entries = await getEntries(issuecode);
    return {
      releaseDate: (
        await prismaCoa.inducks_issue.findFirstOrThrow({
          where: { issuecode },
        })
      ).oldestdate!,
      entries,
    };
  },

  getIssueCoverDetails: async (issuecodes: string[]) =>
    issuecodes.length > 10
      ? { error: "Too many requests" }
      : getIssueCoverDetails(issuecodes),

  getIssueCoverDetailsByPublicationcode: async (publicationcode: string) => {
    const issuecodes = (
      await prismaCoa.inducks_issue.findMany({
        select: { issuecode: true },
        where: { publicationcode },
      })
    ).map(({ issuecode }) => issuecode);
    return getIssueCoverDetails(issuecodes);
  },

  getIssuePopularities: (issuecodes: string[]) =>
    getPopularityByIssuecodes(issuecodes),
};

export const getCoverUrls = async (issuecodes: string[]) => {
  const issues = (
    await prismaCoa.inducks_issue.findMany({
      select: {
        issuecode: true,
        title: true,
      },
      where: {
        issuecode: {
          in: issuecodes,
        },
      },
    })
  ).groupBy("issuecode");
  const entrycodeByIssuecode = (
    await prismaCoa.inducks_entry.findMany({
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
      orderBy: [
        {
          position: "desc",
        },
      ],
    })
  ).groupBy("issuecode", "entrycode");
  const entryurls = (
    await prismaCoa.inducks_entryurl.findMany({
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
    })
  ).groupBy("entrycode");

  return Object.entries(issues).map(([issuecode, issue]) => {
    const coverEntryUrl = entryurls[entrycodeByIssuecode[issuecode]];
    if (!coverEntryUrl) {
      return {
        issuecode,
        title: issue.title!,
        fullUrl: null,
      };
    }

    const urlPrefix = /^\d/.test(coverEntryUrl.url!)
      ? "webusers/webusers"
      : coverEntryUrl.url!.startsWith("webusers")
        ? "webusers"
        : coverEntryUrl.sitecode;
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

const getIssueCoverDetails = (issuecodes: string[]) =>
  getCoverUrls(issuecodes)
    .then((data) => data.groupBy("issuecode"))
    .then((data) => ({ covers: data }));
