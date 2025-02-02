import type { SimpleIssueWithPartInfo } from "~dm-types/SimpleIssue";
import type { StorySearchResults } from "~dm-types/StorySearchResults";
import { Prisma } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

export default {
  getStoryDetails: async (storycodes: string[]) =>
    Promise.all([
      prismaCoa.inducks_story.findMany({
        where: {
          storycode: { in: storycodes },
        },
      }),
      prismaCoa.$queryRaw<{ storycode: string; url: string }[]>`
      select s.storycode, CONCAT('webusers/webusers/', url) AS url
      from inducks_story s
              inner join coa.inducks_storyversion sv on s.originalstoryversioncode = sv.storyversioncode
              inner join coa.inducks_entry e using (storyversioncode)
              inner join coa.inducks_entryurl eu using (entrycode)
      where s.storycode IN (${Prisma.join(storycodes)})
        and eu.sitecode = 'webusers'
      group by s.storycode`,
    ])
      .then(([stories, storyUrls]) => ({
        stories: stories.groupBy("storycode"),
        storyUrls: storyUrls.groupBy("storycode", "url"),
      }))
      .catch((e) => {
        return { error: "Error", errorDetails: e };
      }),

  getStoryversionsDetails: (storyversioncodes: string[]) =>
    prismaCoa.inducks_storyversion
      .findMany({
        where: {
          storyversioncode: { in: storyversioncodes },
        },
      })
      .then((data) => ({ storyversions: data.groupBy("storyversioncode") }))
      .catch((e) => ({ error: "Error", errorDetails: e })),

  getStoryjobs: (storyversioncode: string) =>
    prismaCoa.inducks_storyjob
      .findMany({
        where: {
          storyversioncode,
        },
      })
      .then((data) => ({ data }))
      .catch((e) => ({ error: "Error", errorDetails: e })),

  searchStory: async <WithIssues extends boolean>(
    keywords: string[],
    withIssues: WithIssues,
  ) => {
    const limit = 10;
    const joinedKeywords = keywords.join(" ");
    let results = await prismaCoa.$queryRaw<
      StorySearchResults<WithIssues>["results"]
    >`
      SELECT inducks_storyversion.storycode,
             inducks_storyversion.entirepages,
             inducks_entry.title,
             MATCH (inducks_entry.title) AGAINST (${joinedKeywords}) /
             (IF(inducks_storyversion.kind = 'n', 1, 2)) AS score
      FROM inducks_entry
               INNER JOIN inducks_storyversion ON inducks_entry.storyversioncode = inducks_storyversion.storyversioncode
      WHERE inducks_storyversion.storycode <> ''
        AND MATCH (inducks_entry.title) AGAINST (${joinedKeywords})
      GROUP BY inducks_storyversion.storycode
      ORDER BY score DESC, inducks_entry.title
      LIMIT ${limit + 1}
  `;

    const hasMore = results.length > limit;
    results = results.slice(0, limit);

    if (withIssues) {
      const resultsWithIssues: StorySearchResults<true>["results"] = [];
      for (const idx of results.keys()) {
        resultsWithIssues[idx] = {
          ...results[idx],
          issues: await listIssuesFromStoryCode(results[idx].storycode),
        };
      }

      return {
        results: resultsWithIssues,
        hasMore,
      };
    } else {
      return {
        results,
        hasMore,
      };
    }
  },

  searchStoryByStorycode: async(
    partialStorycode: string,
  ) => {
    const limit = 10;
    let results = await prismaCoa.$queryRaw<
      StorySearchResults<false>["results"]
    >`
      SELECT storycode, title,
      MATCH (storycode) AGAINST (${partialStorycode}) as score
      FROM inducks_story
      WHERE storycode <> ''
        AND MATCH (storycode) AGAINST (${partialStorycode})
      ORDER BY score desc
      LIMIT ${limit + 1}
  `;

    const hasMore = results.length > limit;
    results = results.slice(0, limit);
      return {
        results,
        hasMore,
      };
  }
};

const listIssuesFromStoryCode = async (storycode: string) =>
  prismaCoa.$queryRaw<SimpleIssueWithPartInfo[]>`
    SELECT i.issuecode,
           e.storyversioncode,
           e.part,
           sv.estimatedpanels,
           sv_o.estimatedpanels AS total_estimatedpanels
    FROM inducks_issue i
      INNER JOIN inducks_entry e USING (issuecode)
      INNER JOIN inducks_storyversion sv USING (storyversioncode)
      INNER JOIN inducks_storyversion sv_o ON sv.storycode = sv_o.storyversioncode
    WHERE sv.storycode = ${storycode}
    GROUP BY i.issuecode
  `;
