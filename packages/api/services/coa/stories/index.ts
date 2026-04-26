import type { SimpleIssueWithPartInfo } from "~dm-types/SimpleIssue";
import type { SimpleStory } from "~dm-types/SimpleStory";
import type { StorySearchResults } from "~dm-types/StorySearchResults";
import type { inducks_story } from "~prisma-schemas/schemas/coa";
import { Prisma } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

const getStoryAndStoryversionDetails = async (
  searchResults: StorySearchResults<false>["results"],
) => {
  const storyDetailsOutput = await getStoryDetails(
    searchResults.map(({ storycode }) => storycode),
  );

  if (!("stories" in storyDetailsOutput)) {
    return {
      error: `Error when calling getStoryDetails`,
    };
  }
  const storyDetails = storyDetailsOutput.stories;
  const storyUrls = storyDetailsOutput.storyUrls;

  const storyversionDetailsOutput = await getStoryversionsDetails(
    searchResults.map(
      ({ storycode }) => storyDetails[storycode].originalstoryversioncode!,
    ),
  );

  if (!("storyversions" in storyversionDetailsOutput)) {
    return {
      error: `Error when calling getStoryversionsDetails`,
    };
  }

  const storyversionDetails = storyversionDetailsOutput.storyversions;

  return searchResults
    .filter(
      ({ storycode }) =>
        storyDetails[storycode].originalstoryversioncode && storyDetails[storycode].originalstoryversioncode in storyversionDetails
    )
    .map(({ storycode, score }) => {
      const storyversion = storyversionDetails[storyDetails[storycode].originalstoryversioncode!];
    return ({
      ...storyDetails[storycode],
      ...storyversion,
      kind: storyversion.kind!,
      score,
      storycode,
      url: storyUrls[storycode],
    });
  });
};

const getFullStoriesFromKeywords = async (keywords: string[]) => {
  const { results: searchResults, hasMore } = await searchStory(keywords, {
    withIssues: false,
  });

  const stories = await getStoryAndStoryversionDetails(searchResults);

  if ("error" in stories) {
    return {
      error: `Error when calling getStoryAndStoryversionDetails`,
    };
  }

  return {
    stories,
    hasMore,
  };
};

const getStoryDetails = async (storycodes: string[]) =>
  !storycodes.length
    ? {
        stories: {} as Record<string, inducks_story>,
        storyUrls: {} as Record<string, string>,
      }
    : Promise.all([
        prismaCoa.inducks_story.findMany({
          where: {
            storycode: { in: storycodes },
          },
        }),
        prismaCoa.$queryRaw<{ storycode: string; url: string }[]>`
            SELECT s.storycode,
                   MIN(CONCAT('webusers/webusers/', eu.url)) AS url
            FROM inducks_story s
                     INNER JOIN coa.inducks_storyversion sv ON s.storycode = sv.storycode
                     INNER JOIN coa.inducks_entry e USING (storyversioncode)
                     INNER JOIN coa.inducks_entryurl eu USING (entrycode)
            WHERE sv.storycode = s.storycode
              AND s.storycode IN (${Prisma.join(storycodes)})
              AND eu.sitecode = 'webusers'
            GROUP BY s.storycode`,
      ])
        .then(([stories, storyUrls]) => ({
          stories: stories.groupBy("storycode"),
          storyUrls: storyUrls.groupBy("storycode", "url"),
        }))
        .catch((e) => ({ error: "Error", errorDetails: e }));

const getStoryversionsDetails = (storyversioncodes: string[]) =>
  prismaCoa.inducks_storyversion
    .findMany({
      where: {
        storyversioncode: { in: storyversioncodes },
      },
    })
    .then((data) => ({ storyversions: data.groupBy("storyversioncode") }))
    .catch((e) => ({ error: "Error", errorDetails: e }));

  const getStoryPreviousTitles = async (storycode: string, languagecode: string) =>
    prismaCoa.$queryRaw<{ title: string }[]>`
      select DISTINCT inducks_entry.title AS title
      from inducks_storyversion
      inner join inducks_entry using (storyversioncode)
      inner join inducks_issue using (issuecode)
      inner join inducks_publication using (publicationcode)
      inner join inducks_country using (countrycode)
      where storycode=${storycode}
      and COALESCE(inducks_entry.languagecode, inducks_publication.languagecode, inducks_country.defaultlanguage) = ${languagecode}
      order by oldestdate desc;
    `.then((data) => data.map(({ title }) => ( title )));

const getStoriesStoryjobs = (storyversioncodes: string[]) =>
  prismaCoa.inducks_storyjob
    .findMany({
      select: {
        storyversioncode: true,
        personcode: true,
        plotwritartink: true,
      },
      where: {
        storyversioncode: { in: storyversioncodes },
      },
    })
    .then((data) => ({ data: data.groupBy("storyversioncode", "[]") }))
    .catch((e) => ({ error: "Error", errorDetails: e }));

const getStoriesHeroCharacter = (storycodes: string[]) =>
  prismaCoa.inducks_herocharacter 
    .findMany({
      select: {
        storycode: true,
        charactercode: true,
      },
      where: {
        storycode: { in: storycodes },
      },
    })
    .then((data) => ({ data: data.groupBy("storycode", "charactercode") }))
    .catch((e) => ({ error: "Error", errorDetails: e }));

const searchStory = async <WithIssues extends boolean>(
  keywords: string[],
  options: {
    withIssues: WithIssues;
    kind?: SimpleStory["kind"];
  },
) => {
  const limit = 10;
  const joinedKeywords = keywords.join(" ");
  let results = await prismaCoa.$queryRaw<
    StorySearchResults<WithIssues>["results"]
  >`
      SELECT inducks_storyversion.storycode,
             inducks_storyversion.entirepages,
             inducks_storyversion.kind,
             inducks_entry.title,
             MATCH (inducks_entry.title) AGAINST (${joinedKeywords}) /
             (IF(inducks_storyversion.kind = 'n', 1, 2)) AS score
      FROM inducks_entry
               INNER JOIN inducks_storyversion ON inducks_entry.storyversioncode = inducks_storyversion.storyversioncode
      WHERE inducks_storyversion.storycode <> ''
        AND (inducks_storyversion.kind = ${options.kind} OR ${options.kind} IS NULL)
        AND MATCH (inducks_entry.title) AGAINST (${joinedKeywords})
      GROUP BY inducks_storyversion.storycode
      ORDER BY score DESC, inducks_entry.title
      LIMIT ${limit + 1}
  `;

  const hasMore = results.length > limit;
  results = results.slice(0, limit);

  if (options.withIssues) {
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
};

const searchStoryByStorycode = async (partialStorycode: string) => {
  const limit = 10;
  const results = await prismaCoa.$queryRaw<
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
  const resultsWithDetails = await getStoryAndStoryversionDetails(
    results.slice(0, limit),
  );

  if ("error" in resultsWithDetails) {
    return {
      error: `Error when calling getStoryAndStoryversionDetails`,
    };
  }

  return {
    stories: resultsWithDetails,
    hasMore,
  };
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

export default {
  getFullStoriesFromKeywords,
  getStoryDetails,
  getStoryversionsDetails,
  getStoryPreviousTitles,
  getStoriesStoryjobs,
  getStoriesHeroCharacter,
  searchStory,
  searchStoryByStorycode,
  listIssuesFromStoryCode,
};
