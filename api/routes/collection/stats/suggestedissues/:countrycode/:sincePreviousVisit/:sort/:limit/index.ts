import { Handler } from "express";

import { getPublicationTitlesFromCodes } from "~/routes/coa/list/publications/:publicationCodes";
import {
  inducks_publication,
  PrismaClient as PrismaClientCoa,
} from "~prisma_clients/client_coa";
import {
  PrismaClient as PrismaClientDm,
  users_options_Option_nom,
} from "~prisma_clients/client_dm";
import {
  Prisma as PrismaDmStats,
  PrismaClient as PrismaClientDmStats,
} from "~prisma_clients/client_dm_stats";

const prismaCoa = new PrismaClientCoa();
const prismaDm = new PrismaClientDm();
const prismaDmStats = new PrismaClientDmStats();

enum COUNTRY_CODE_OPTION {
  ALL = "ALL",
  countries_to_notify = "countries_to_notify",
}

export const get: Handler = async (req, res) => {
  const { countrycode, sincePreviousVisit, sort, limit } = req.params;
  const since =
    sincePreviousVisit === "since_previous_visit"
      ? (await prismaDm.user.findUnique({ where: { id: req.user.id } }))!
          .previousAccess
      : null;

  const { suggestionsPerUser, authors, storyDetails, publicationTitles } =
    await getSuggestions(
      since,
      countrycode,
      sort,
      req.user.id,
      parseInt(limit),
      true
    );

  const suggestionsForUser =
    suggestionsPerUser[req.user.id] || new IssueSuggestionList();

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      ...suggestionsForUser,
      authors,
      storyDetails,
      publicationTitles,
    })
  );
};

const suggestedPublications =
  PrismaDmStats.validator<PrismaDmStats.utilisateurs_publications_suggereesArgs>()(
    {
      select: {
        userId: true,
        score: true,
        publicationcode: true,
        issuenumber: true,
        oldestdate: true,
      },
    }
  );

const missingPublications =
  PrismaDmStats.validator<PrismaDmStats.utilisateurs_publications_manquantesArgs>()(
    {
      select: { personcode: true, storycode: true },
    }
  );

interface Suggestion
  extends PrismaDmStats.utilisateurs_publications_manquantesGetPayload<
      typeof missingPublications
    >,
    PrismaDmStats.utilisateurs_publications_suggereesGetPayload<
      typeof suggestedPublications
    > {}

interface SuggestionList {
  storyDetails: { [p: string]: StoryDetail };
  suggestionsPerUser: { [p: number]: IssueSuggestionList };
  publicationTitles: { [p: string]: inducks_publication };
  authors: { [p: string]: string };
}

interface IssueSuggestion {
  issuecode: string;
  score: number;
  stories: { [key: string]: string[] };
  publicationcode: string;
  issuenumber: string;
  oldestdate: Date;
}

class IssueSuggestionList {
  issues: { [key: string]: IssueSuggestion } = {};
  minScore = 0;
  maxScore = 0;
}

interface StoryDetail {
  personcode: string | null;
  storycode: string;
  storycomment: string;
  title: string;
}

const getStoryDetails = async (
  storyCodes: string[],
  associatedPublicationCodes: string[],
  associatedIssueNumbers: string[]
) => {
  if (!storyCodes.length) {
    return {};
  }

  const stories = (
    await prismaCoa.$queryRawUnsafe<StoryDetail[]>(`
      SELECT story.storycode,
             story.storycomment,
             COALESCE(entry.title, story.title) as title,
             null as personcode
      FROM inducks_story as story
          INNER JOIN inducks_storyversion storyversion on story.storycode = storyversion.storycode
          INNER JOIN inducks_entry entry on storyversion.storyversioncode = entry.storyversioncode
          INNER JOIN inducks_issue issue on entry.issuecode = issue.issuecode
          WHERE ${storyCodes
            .map(
              (storyCode, idx) =>
                `story.storycode = '${storyCode}' AND issue.publicationcode = '${associatedPublicationCodes[idx]}' AND issue.issuenumber = '${associatedIssueNumbers[idx]}'`
            )
            .join(" OR ")}
      ORDER BY story.storycode
  `)
  ).reduce((acc, story) => ({ ...acc, [story.storycode]: story }), {}) as {
    [key: string]: StoryDetail;
  };

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

const getSuggestions = async (
  since: Date | null,
  countrycode: string,
  sort: string,
  singleUserId: number | null,
  limit: number | null,
  withStoryDetails: boolean
): Promise<SuggestionList> => {
  const emptySuggestionList = {
    storyDetails: {},
    suggestionsPerUser: {},
    publicationTitles: {},
    authors: {},
  } as SuggestionList;
  if (!["score", "oldestdate"].includes(sort)) {
    return emptySuggestionList;
  }
  const singleCountry = Object.values(COUNTRY_CODE_OPTION).includes(
    countrycode as COUNTRY_CODE_OPTION
  )
    ? null
    : countrycode;
  const suggestions = await prismaDmStats.$queryRawUnsafe<Suggestion[]>(`
      SELECT suggested.ID_User AS userId,
             suggested.Score   AS score,
             suggested.publicationcode,
             suggested.issuenumber,
             suggested.oldestdate,
             missing.personcode,
             missing.storycode
      FROM utilisateurs_publications_suggerees as suggested
               INNER JOIN utilisateurs_publications_manquantes as missing
                          USING (ID_User, publicationcode, issuenumber)
      WHERE suggested.oldestdate <= '${new Date().toISOString().split("T")[0]}'
        AND (${
          since
            ? `suggested.oldestdate > '${since.toISOString().split("T")[0]}'`
            : "1=1"
        })
        AND (${singleUserId ? `suggested.ID_User = ${singleUserId}` : "1=1"})
        AND (${
          singleCountry
            ? `suggested.publicationcode LIKE '${singleCountry}/%'`
            : "1=1"
        })
      ORDER BY ID_User, ${sort} DESC, publicationcode, issuenumber
  `);

  if (!suggestions.length) {
    return emptySuggestionList;
  }

  const countriesToNotifyPerUser =
    countrycode === COUNTRY_CODE_OPTION.countries_to_notify
      ? await getOptionValueAllUsers(
          users_options_Option_nom.suggestion_notification_country
        )
      : null;

  const suggestionsPerUser = {} as { [key: number]: IssueSuggestionList };
  const referencedIssues = [];
  const referencedStories = [] as Suggestion[];
  for (const suggestedStory of suggestions) {
    const { userId } = suggestedStory;

    if (
      isSuggestionInCountriesToNotify(
        countriesToNotifyPerUser,
        userId,
        suggestedStory
      )
    ) {
      if (!suggestionsPerUser[userId]) {
        suggestionsPerUser[userId] = new IssueSuggestionList();
      }

      const issuecode = [
        suggestedStory.publicationcode,
        suggestedStory.issuenumber,
      ].join(" ");
      if (
        limit &&
        !suggestionsPerUser[userId].issues[issuecode] &&
        Object.keys(suggestionsPerUser[userId].issues).length >= limit
      ) {
        continue;
      }
      let issue = suggestionsPerUser[userId].issues[issuecode];
      if (!issue) {
        issue = {
          ...suggestedStory,
          issuecode,
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
      ({ score }) => score
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
  ).reduce(
    (acc, value) => ({ ...acc, [value.personcode]: value.fullname }),
    {}
  ) as { [key: string]: string };

  let storyDetails: { [p: string]: StoryDetail } = {};
  if (withStoryDetails) {
    storyDetails = await getStoryDetails(
      referencedStories.map(({ storycode }) => storycode),
      referencedStories.map(({ publicationcode }) => publicationcode),
      referencedStories.map(({ issuenumber }) => issuenumber)
    );

    for (const referencedStory of referencedStories) {
      storyDetails[referencedStory.storycode].personcode =
        referencedStory.personcode;
    }
  }

  const publicationTitles = await getPublicationTitlesFromCodes(
    referencedIssues.map(({ publicationcode }) => publicationcode)
  );

  return { suggestionsPerUser, authors, storyDetails, publicationTitles };
};

const isSuggestionInCountriesToNotify = (
  countriesToNotify: { [p: number]: string[] } | null,
  userId: number,
  suggestion: Suggestion
): boolean =>
  !countriesToNotify
    ? true
    : !countriesToNotify[userId]
    ? false
    : countriesToNotify[userId].some(
        (countryToNotify) =>
          suggestion.publicationcode.indexOf(`${countryToNotify}/`) === 0
      );

const getOptionValueAllUsers = async (
  optionName: users_options_Option_nom
): Promise<{ [key: number]: string[] }> =>
  (
    await prismaDm.userOption.findMany({
      where: {
        optionName,
      },
    })
  ).reduce(
    (acc, value) => ({
      ...acc,
      [value.userId]: [...(acc[value.userId] || []), value],
    }),
    {} as { [key: string]: string[] }
  );