import type { IssueWithIssuecodeOnly } from "~dm-types/IssueWithIssuecodeOnly";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

export default {
  getIssues: (issuecodes: string[], withTitles: boolean) =>
    prismaCoa
      .augmentIssueArrayWithInducksData(
        issuecodes.map((issuecode) => ({ issuecode })),
        withTitles,
      )
      .then((data) => data.groupBy("issuecode")),
      
  getCoaCountByPublicationcode: (publicationcodes: string[]) =>
    prismaCoa.inducks_issue
      .groupBy({
        _count: {
          issuenumber: true,
        },
        where: {
          publicationcode: {
            in: publicationcodes,
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
    
  getCoaCountByCountrycode: (countrycodes: string[]) =>
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

  getIssuecodesByPublicationcodes: async (publicationcodes: string[]) =>
    prismaCoa.inducks_issue
      .findMany({
        select: {
          publicationcode: true,
          issuecode: true,
          issuenumber: true,
        },
        where: {
          publicationcode: {
            in: publicationcodes,
          },
        },
      })
      .then((data) => data.groupBy("publicationcode", "issuecode[]")),

  getIssuesByPublicationcode: async (publicationcode: string) =>
    prismaCoa.inducks_issue.findMany({
      select: {
        issuecode: true,
        issuenumber: true,
      },
      where: {
        publicationcode,
      },
    }),

  getIssuesByStorycode: async (storycode: string) =>
    prismaCoa.$queryRaw<IssueWithIssuecodeOnly[]>`
      SELECT publicationcode, issuenumber, issuecode
      FROM inducks_issue issue
                INNER JOIN inducks_entry entry using (issuecode)
                INNER JOIN inducks_storyversion sv using (storyversioncode)
      WHERE sv.storycode = ${storycode}
      GROUP BY publicationcode, issuenumber
      ORDER BY publicationcode`,

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
