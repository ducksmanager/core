import { COVER, STORY } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import prisma from "~prisma/client";

import type {
  FullEntry,
  FullIndexation,
  IndexationAiContext,
} from "../context";
import { runOcrOnImage } from "../ocr";
import {
  getFullStoriesFromKeywords,
  getPublicationLanguagecode,
  getStoriesFromImage,
} from "../story-search";

type EntryImage = NonNullable<FullIndexation["pages"][number]["image"]>;

type StorySearchStrategy = {
  name: string;
  field: "aiStorySearchResult" | "aiOcrResult";
  storyField: "aiStorySearchPossibleStory" | "aiOcrPossibleStory";
};

// The two strategies are tried in order; the first one that produces matches wins.
const STRATEGIES: StorySearchStrategy[] = [
  {
    name: "image-based story search",
    field: "aiStorySearchResult",
    storyField: "aiStorySearchPossibleStory",
  },
  {
    name: "OCR-based story search",
    field: "aiOcrResult",
    storyField: "aiOcrPossibleStory",
  },
];

const runStorySearch = async (
  ctx: IndexationAiContext,
  entry: FullEntry,
  image: EntryImage,
  strategy: StorySearchStrategy,
  isCover: boolean,
  languagecode: string,
) =>
  strategy.field === "aiStorySearchResult"
    ? getStoriesFromImage(image, isCover)
    : getFullStoriesFromKeywords(
        (
          await runOcrOnImage(ctx, entry.position, image, languagecode)
        ).map(({ text }) => text),
      );

// Ensures the ai*Result row exists and is linked to the image, clearing any
// previous suggestions for the strategy, then (if there are matches) creates the
// new story suggestions and re-accepts the previously accepted story if present.
// Returns true when matches were persisted.
const persistStorySuggestions = async ({
  entry,
  image,
  strategy,
  results,
  currentlyAcceptedStorycode,
}: {
  entry: FullEntry;
  image: EntryImage;
  strategy: StorySearchStrategy;
  results: { stories: { storycode: string; score: number }[] };
  currentlyAcceptedStorycode: string | undefined;
}) => {
  const { name, field, storyField } = strategy;

  let aiResultId = (
    await prisma.image.findUnique({ where: { id: image.id } })
  )?.[`${field}Id`];

  if (aiResultId) {
    if (field === "aiOcrResult") {
      await prisma.storySuggestion.deleteMany({
        where: {
          aiStorySuggestion: { aiOcrPossibleStory: { resultId: aiResultId } },
        },
      });
      await prisma.aiOcrPossibleStory.deleteMany({
        where: { resultId: aiResultId },
      });
    } else {
      await prisma.storySuggestion.deleteMany({
        where: {
          aiStorySuggestion: {
            aiStorySearchPossibleStory: { resultId: aiResultId },
          },
        },
      });
      await prisma.aiStorySearchPossibleStory.deleteMany({
        where: { resultId: aiResultId },
      });
    }
  } else {
    aiResultId =
      field === "aiOcrResult"
        ? (await prisma.aiOcrResult.create({ data: {} })).id
        : (await prisma.aiStorySearchResult.create({ data: {} })).id;
  }

  await prisma.image.update({
    where: { id: image.id },
    data: { [`${field}Id`]: aiResultId },
  });

  if (!results.stories.length) {
    console.info(
      `Entry starting at page ${entry.position}: No ${name} results found`,
    );
    return false;
  }

  console.log(
    `Entry starting at page ${entry.position}: ${results.stories.length} ${name} matches found`,
  );
  await prisma.storySuggestion.deleteMany({
    where: {
      aiStorySuggestion: {
        [storyField]: {
          // aiOcrPossibleStory or aiStorySearchPossibleStory
          isNot: null,
        },
      },
      entryId: entry.id,
    },
  });

  const storiesWithScores = results.stories.groupBy("storycode", "score[]");

  for (const storycode of Object.keys(storiesWithScores)) {
    console.log("Creating story suggestion for storycode", storycode);
    const data = {
      aiStorySuggestion: {
        create: {
          [storyField]: {
            // aiOcrPossibleStory or aiStorySearchPossibleStory
            create: {
              [field]: {
                // aiOcrResult or aiStorySearchResult
                connect: {
                  id: aiResultId,
                },
              },
              score: storiesWithScores[storycode].sort((a, b) => b - a)[0],
            },
          },
        },
      },
      storycode,
      entry: {
        connect: {
          id: entry.id,
        },
      },
    };
    await prisma.storySuggestion.upsert({
      where: {
        entryId_storycode: {
          entryId: entry.id,
          storycode,
        },
      },
      create: data,
      update: data,
    });
  }

  const newEntry = (await prisma.entry.findUnique({
    include: {
      storySuggestions: {
        include: {
          aiStorySuggestion: {
            include: {
              [storyField]: true, // ocrDetails or storySearchDetails
            },
          },
        },
      },
    },
    where: {
      id: entry.id,
    },
  }))!;
  const acceptedStorySuggestionId = newEntry.storySuggestions.find(
    ({ storycode }) => storycode === currentlyAcceptedStorycode,
  )?.id;
  // If no story is currently accepted, we accept the first story suggestion
  if (acceptedStorySuggestionId) {
    await prisma.entry.update({
      where: {
        id: entry.id,
      },
      data: {
        acceptedStory: {
          connect: {
            id: acceptedStorySuggestionId,
          },
        },
      },
    });
  }
  return true;
};

const createEntryStorySuggestions = async (
  ctx: IndexationAiContext,
  entry: FullEntry,
  languagecode: string,
) => {
  const currentlyAcceptedStorycode = entry.acceptedStory?.storycode;
  const firstPageOfEntry = getEntryPages(ctx.indexation, entry.id)[0];
  if (!firstPageOfEntry.image) {
    return;
  }
  const image = firstPageOfEntry.image;
  const isCover = entry.acceptedStoryKind?.storyKindRows?.kind === COVER;

  ctx.events.reportCreateAiStorySuggestions(entry.id);

  for (const strategy of STRATEGIES) {
    const results = await runStorySearch(
      ctx,
      entry,
      image,
      strategy,
      isCover,
      languagecode,
    );
    if ("error" in results) {
      console.error(results.error);
      continue;
    }
    const created = await persistStorySuggestions({
      entry,
      image,
      strategy,
      results,
      currentlyAcceptedStorycode,
    });
    if (created) {
      break;
    }
  }

  ctx.events.reportCreateAiStorySuggestionsEnd(entry.id);
};

export const createAiStorySuggestions = async (ctx: IndexationAiContext) => {
  const { indexation } = ctx;
  const languagecode = indexation.acceptedIssueSuggestion?.publicationcode
    ? await getPublicationLanguagecode(
        indexation.acceptedIssueSuggestion.publicationcode,
      )
    : "en";

  for (const entry of indexation.entries) {
    if (
      [STORY, COVER].includes(entry.acceptedStoryKind?.storyKindRows?.kind ?? "")
    ) {
      await createEntryStorySuggestions(ctx, entry, languagecode);
    } else {
      console.log(
        `Entry starting at page ${entry.position}: This entry is not a story or a cover`,
      );
    }
  }
};
