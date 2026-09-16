import type { SimpleEntry } from "~dm-types/SimpleEntry";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

export const getPrefixedEntryurl = (url: string, sitecode: string) =>
  `${
    /^\d/.test(url)
      ? "webusers/webusers"
      : url.startsWith("webusers")
        ? "webusers"
        : sitecode?.replace(/thumbnails2?/, "")
  }/${url}`;

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
  getIssueDetails: ev(
    v.config(v.pipe(v.string(), v.nonEmpty()), {
      message: "Invalid issuecode",
    }),
  )(async (issuecode) => {
    const issue = await prismaCoa.inducks_issue.findFirst({
      where: { issuecode },
    });
    if (!issue) {
      return { error: "Issue not found" };
    }
    return {
      releaseDate: issue.oldestdate!,
      entries: await getEntries(issuecode),
    };
  }),

  getIssueCoverDetails: ev(
    v.pipe(v.array(v.string()), v.maxLength(10, "Too many requests")),
  )(async (issuecodes) => getIssueCoverDetails(issuecodes)),

  getIssueCoverDetailsByPublicationcode: ev(v.string())(
    async (publicationcode) => {
      const issuecodes = (
        await prismaCoa.inducks_issue.findMany({
          select: { issuecode: true },
          where: { publicationcode },
        })
      ).map(({ issuecode }) => issuecode);
      return getIssueCoverDetails(issuecodes);
    },
  ),

  getIssuePopularities: ev(v.array(v.string()))(async (issuecodes) =>
    getPopularityByIssuecodes(issuecodes),
  ),
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

  return Object.entries(issues)
    .filter(([issuecode]) => !!entryurls[entrycodeByIssuecode[issuecode]]?.url)
    .map(([issuecode, issue]) => {
      const coverEntryUrl = entryurls[entrycodeByIssuecode[issuecode]];
      return {
        issuecode,
        title: issue.title!,
        fullUrl: getPrefixedEntryurl(
          coverEntryUrl.url!,
          coverEntryUrl.sitecode!,
        ),
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
