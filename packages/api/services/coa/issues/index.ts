import type { IssueWithIssuecodeOnly } from "~dm-types/IssueWithIssuecodeOnly";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

export default {
  getIssues: ev(
    v.array(v.string()),
    v.array(v.union([v.literal("title"), v.literal("fullyindexed")])),
  )((issuecodes, withFields) =>
    prismaCoa
      .augmentIssueArrayWithInducksData(
        issuecodes.map((issuecode) => ({ issuecode })),
        (withFields || []).filter((field) =>
          ["title", "fullyindexed"].includes(field),
        ),
      )
      .then((data) => data.groupBy("issuecode")),
  ),

  getCoaCountByPublicationcode: ev(v.array(v.string()))((publicationcodes) =>
    prismaCoa.inducks_issue
      .groupBy({
        _count: {
          issuenumber: true,
        },
        where: {
          publicationcode: {
            in: publicationcodes.filter((p): p is string => !!p),
          },
        },
        by: ["publicationcode"],
      })
      .then((data) =>
        Object.fromEntries(
          data.map(({ publicationcode, _count }) => [
            publicationcode,
            _count.issuenumber,
          ]),
        ),
      ),
  ),

  getCoaCountByCountrycode: ev(v.array(v.string()))((countrycodes) =>
    prismaCoa.inducks_issue
      .groupBy({
        _count: {
          issuenumber: true,
        },
        where: {
          OR: countrycodes.map((countrycode) => ({
            publicationcode: {
              startsWith: `${countrycode}/`,
            },
          })),
        },
        by: ["publicationcode"],
      })
      .then((data) =>
        data.reduce<Record<string, number>>(
          (acc, { publicationcode, _count }) => {
            const countrycode = publicationcode.split("/")[0];
            acc[countrycode] = _count.issuenumber + (acc[countrycode] || 0);
            return acc;
          },
          {},
        ),
      ),
  ),

  getIssuecodesByPublicationcodes: ev(v.array(v.string()))(
    async (publicationcodes) =>
      prismaCoa.inducks_issue
        .findMany({
          select: {
            publicationcode: true,
            issuecode: true,
            issuenumber: true,
          },
          where: {
            publicationcode: {
              in: publicationcodes.filter((p): p is string => !!p),
            },
          },
          orderBy: {
            issuecode: "asc",
          },
        })
        .then((data) => data.groupBy("publicationcode", "issuecode[]")),
  ),

  getIssuesByPublicationcode: ev(v.string())(async (publicationcode) =>
    prismaCoa.inducks_issue.findMany({
      select: {
        issuecode: true,
        issuenumber: true,
      },
      where: {
        publicationcode,
      },
      orderBy: {
        issuecode: "asc",
      },
    }),
  ),

  getIssuesByStorycode: ev(v.string())(
    async (storycode) =>
      prismaCoa.$queryRaw<IssueWithIssuecodeOnly[]>`
      SELECT publicationcode, issuenumber, issuecode
      FROM inducks_issue issue
                INNER JOIN inducks_entry entry using (issuecode)
                INNER JOIN inducks_storyversion sv using (storyversioncode)
      WHERE sv.storycode = ${storycode}
      GROUP BY publicationcode, issuenumber
      ORDER BY publicationcode`,
  ),

  getRecentIssues: () =>
    prismaCoa.inducks_issue.findMany({
      select: {
        publicationcode: true,
        issuenumber: true,
        issuecode: true,
        oldestdate: true,
      },
      where: {
        oldestdate: {
          lte: new Date().toISOString().split("T")[0],
        },
      },
      orderBy: [{ oldestdate: "desc" }],
      take: 50,
    }),
};
