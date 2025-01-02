import { UserSocket } from "~/index";
import type { IssueSuggestion } from "~dm-types/IssueSuggestion";
import { IssueSuggestionList } from "~dm-types/IssueSuggestionList";
import type { StoryDetail } from "~dm-types/StoryDetail";
import type { SuggestionList } from "~dm-types/SuggestionList";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { userOptionType } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import type { Prisma as PrismaDmStats } from "~prisma-schemas/schemas/dm_stats";
import { prismaClient as prismaDmStats } from "~prisma-schemas/schemas/dm_stats/client";

export enum COUNTRY_CODE_OPTION {
  ALL = "ALL",
  countries_to_notify = "countries_to_notify",
}

export default (socket: UserSocket) => ({
  getSuggestionsForCountry: async (
    countrycode: string,
    sincePreviousVisit: "since_previous_visit" | "_",
    limit: number,
  ) => {
    const user = socket.data.user;
    const since =
      sincePreviousVisit === "since_previous_visit"
        ? (await prismaDm.user.findUnique({ where: { id: user!.id } }))!
            .previousAccess
        : null;

    return Promise.all(
      (["oldestdate", "score"] as const).map((sort) =>
        getSuggestions(since, countrycode, sort, user!.id, limit, true).then(
          (results) => {
            const { suggestionsPerUser, authors, storyDetails } = results;
            const suggestionsForUser =
              suggestionsPerUser[user!.id] || new IssueSuggestionList();
            return {
              sort,
              issues: suggestionsForUser.issues,
              minScore: suggestionsForUser.minScore,
              maxScore: suggestionsForUser.maxScore,
              authors,
              storyDetails,
            };
          },
        ),
      ),
    ).then((results) => results.groupBy("sort"));
  },
});

type SuggestedPublications = {
  select: {
    userId: true;
    score: true;
    issuecode: true;
    oldestdate: true;
  };
};

type MissingPublications = {
  select: { personcode: true; storycode: true };
};

interface Suggestion
  extends PrismaDmStats.missingIssueForUserGetPayload<MissingPublications>,
    PrismaDmStats.suggestedIssueForUserGetPayload<SuggestedPublications> {}

const getStoryDetails = async (
  storyCodes: string[],
  associatedIssuecodes: string[],
) => {
  if (!storyCodes.length) {
    return {};
  }

  const stories = Object.fromEntries(
    (
      await prismaCoa.$queryRawUnsafe<StoryDetail[]>(`
      SELECT story.storycode,
             story.storycomment,
             COALESCE(entry.title, story.title) as title,
             null as personcode
      FROM inducks_story as story
          INNER JOIN inducks_storyversion USING (storycode)
          INNER JOIN inducks_entry entry USING (storyversioncode)
          INNER JOIN inducks_issue issue USING (issuecode)
          WHERE ${storyCodes
            .map(
              (storyCode, idx) =>
                `story.storycode = '${storyCode}' AND issue.issuecode = '${associatedIssuecodes[idx]}'`,
            )
            .join(" OR ")}
      ORDER BY story.storycode
  `)
    ).map((story) => [story.storycode, story]),
  );

  for (const storycode of storyCodes) {
    if (!stories[storycode]) {
      stories[storycode] = {
        storycode,
        storycomment: "",
        title: "?",
        personcode: null,
      };
    }
  }

  return stories;
};

export const getSuggestions = async (
  since: Date | null,
  countrycode: string,
  sort: "score" | "oldestdate",
  singleUserId: number | null,
  limit: number | null,
  withStoryDetails: boolean,
): Promise<SuggestionList> => {
  const emptySuggestionList = {
    storyDetails: {},
    suggestionsPerUser: {},
    authors: {},
  } as SuggestionList;
  if (!["score", "oldestdate"].includes(sort)) {
    return emptySuggestionList;
  }
  const singleCountry = Object.values(COUNTRY_CODE_OPTION).includes(
    countrycode as COUNTRY_CODE_OPTION,
  )
    ? null
    : countrycode;
  const suggestions = await prismaDmStats.$queryRawUnsafe<Suggestion[]>(`
      SELECT suggested.ID_User AS userId,
             suggested.Score   AS score,
             suggested.issuecode,
             replace(suggested.oldestdate,'-00', '-01') AS oldestdate,
             missing.personcode,
             missing.storycode
      FROM utilisateurs_publications_suggerees as suggested
               INNER JOIN utilisateurs_publications_manquantes as missing
                          USING (ID_User, issuecode)
      WHERE suggested.oldestdate <= '${new Date().toISOString().split("T")[0]}'
        AND (${
          since
            ? `suggested.oldestdate > '${since.toISOString().split("T")[0]}'`
            : "1=1"
        })
        AND (${singleUserId ? `suggested.ID_User = ${singleUserId}` : "1=1"})
        AND (${
          singleCountry
            ? `suggested.issuecode LIKE '${singleCountry}/%'`
            : "1=1"
        })
      ORDER BY ID_User, ${sort} DESC, issuecode
      LIMIT 50
  `);

  if (!suggestions.length) {
    return emptySuggestionList;
  }

  const countriesToNotifyPerUser =
    countrycode === COUNTRY_CODE_OPTION.countries_to_notify
      ? await getOptionValueAllUsers(
          userOptionType.suggestion_notification_country,
        )
      : null;

  const suggestionsPerUser: { [userId: number]: IssueSuggestionList } = {};
  const referencedIssues = [];
  const referencedStories: Suggestion[] = [];
  for (const suggestedStory of suggestions) {
    const { userId } = suggestedStory;

    if (
      isSuggestionInCountriesToNotify(
        countriesToNotifyPerUser,
        userId,
        suggestedStory,
      )
    ) {
      if (!suggestionsPerUser[userId]) {
        suggestionsPerUser[userId] = new IssueSuggestionList();
      }

      if (
        limit &&
        !suggestionsPerUser[userId].issues[suggestedStory.issuecode] &&
        Object.keys(suggestionsPerUser[userId].issues).length >= limit
      ) {
        continue;
      }
      let issue = suggestionsPerUser[userId].issues[suggestedStory.issuecode];
      if (!issue) {
        issue = {
          ...suggestedStory,
          oldestdate: suggestedStory.oldestdate?.split("T")[0] || "",
          stories: {},
        } as IssueSuggestion;
      }
      if (!issue.stories[suggestedStory.personcode]) {
        issue.stories[suggestedStory.personcode] = [];
      }
      issue.stories[suggestedStory.personcode].push(suggestedStory.storycode);
      suggestionsPerUser[userId].issues[issue.issuecode] = issue;
      referencedIssues.push(issue);
      referencedStories.push(suggestedStory);
    }
  }

  for (const userId in suggestionsPerUser) {
    const scores = Object.values(suggestionsPerUser[userId].issues).map(
      ({ score }) => score,
    );
    suggestionsPerUser[userId].minScore = Math.min(...scores);
    suggestionsPerUser[userId].maxScore = Math.max(...scores);
  }

  const authors = (
    await prismaCoa.inducks_person.findMany({
      where: {
        personcode: {
          in: [
            ...new Set(referencedStories.map(({ personcode }) => personcode)),
          ],
        },
      },
    })
  )
    .map(({ personcode, fullname }) => ({
      personcode,
      fullname: fullname || personcode,
    }))
    .groupBy("personcode", "fullname");

  let storyDetails: { [storycode: string]: StoryDetail } = {};
  if (withStoryDetails) {
    storyDetails = await getStoryDetails(
      referencedStories.map(({ storycode }) => storycode),
      referencedStories.map(({ issuecode }) => issuecode),
    );

    for (const referencedStory of referencedStories) {
      storyDetails[referencedStory.storycode].personcode =
        referencedStory.personcode;
    }
  }

  return { suggestionsPerUser, authors, storyDetails };
};

const isSuggestionInCountriesToNotify = (
  countriesToNotify: { [userId: number]: string[] } | null,
  userId: number,
  suggestion: Suggestion,
): boolean =>
  !countriesToNotify
    ? true
    : !countriesToNotify[userId]
      ? false
      : countriesToNotify[userId].some((countryToNotify) =>
          suggestion.issuecode?.startsWith(`${countryToNotify}/`),
        );

const getOptionValueAllUsers = async (optionName: userOptionType) =>
  (
    await prismaDm.userOption.findMany({
      where: {
        optionName,
      },
    })
  )
    .map(({ userId, optionValue }) => ({ userId, optionValue }))
    .groupBy("userId", "optionValue[]");
