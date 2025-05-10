import bodyParser from "body-parser";

import { prismaCoa } from "~/prisma";
import { SimpleIssue } from "~dm-types/SimpleIssue";
import { SimpleStory } from "~dm-types/SimpleStory";
import { StorySearchResults } from "~dm-types/StorySearchResults";
import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();

const listIssuesFromStoryCode = async (storycode: string) =>
  prismaCoa.$queryRaw<SimpleIssue[]>`
      SELECT inducks_issue.issuecode, inducks_issue.publicationcode, inducks_issue.issuenumber
      FROM inducks_issue
               INNER JOIN inducks_entry ON inducks_entry.issuecode = inducks_issue.issuecode
               INNER JOIN inducks_storyversion ON inducks_storyversion.storyversioncode = inducks_entry.storyversioncode
      WHERE inducks_storyversion.storycode = ${storycode}
      GROUP BY inducks_issue.publicationcode, inducks_issue.issuenumber
      ORDER BY inducks_issue.publicationcode, inducks_issue.issuenumber
  `;

export const getStoriesByKeywords = async (
  keywords: string[],
  withIssues = false
): Promise<StorySearchResults> => {
  const limit = 10;

  const joinedKeywords = keywords.join(" ");
  let results = await prismaCoa.$queryRaw<SimpleStory[]>`
      SELECT inducks_storyversion.storycode,
             inducks_entry.title                         AS title,
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
    for (const idx of results.keys()) {
      results[idx].issues = await listIssuesFromStoryCode(
        results[idx].storycode
      );
    }
  }

  return {
    results,
    hasMore,
  };
};

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: { results: StorySearchResults };
      reqBody: { keywords: string };
    }>
  ) => {
    if (!req.body.keywords) {
      res.writeHead(400);
      res.end();
    } else {
      return res.json({
        results: await getStoriesByKeywords(req.body.keywords.split(",")),
      });
    }
  },
];
