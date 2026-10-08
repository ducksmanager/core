import axios from "axios";

import { COVER, STORY } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import { releaseYear } from "~dumili-utils/releaseYear";
import prisma from "~prisma/client";
import type { quackinatorFamily } from "~prisma/client_dumili/client";
import type { Seed, Turn } from "~quackinator/types";

import type { FullEntry, FullIndexation } from ".";

type Fact = NonNullable<Seed["facts"]>[number];

/** Tenths of a page, Quackinator's length unit. */
const pageTenths = ({
  entirepages,
  brokenpagenumerator,
  brokenpagedenominator,
}: FullEntry) =>
  entirepages * 10 +
  (brokenpagedenominator
    ? Math.round((10 * brokenpagenumerator) / brokenpagedenominator)
    : 0);

export const canRunOn = (entry: FullEntry) =>
  [STORY, COVER].includes(entry.acceptedStoryKind?.storyKindRows?.kind ?? "") &&
  !entry.includedInEntryId;

const isCover = (entry: FullEntry) =>
  entry.acceptedStoryKind?.storyKindRows?.kind === COVER;

const factsFor = (indexation: FullIndexation, entry: FullEntry): Fact[] => {
  // Quackinator rejects a page count for covers.
  const facts: Fact[] = isCover(entry)
    ? []
    : [{ key: "pages", value: pageTenths(entry) }];
  const year = releaseYear(indexation);
  if (year) {
    facts.push({ key: "decade", value: year });
  }
  return facts;
};

// Raw stored results; Quackinator decides how much to trust each.
const evidenceFor = (indexation: FullIndexation, entry: FullEntry) => {
  const pages = getEntryPages(indexation, entry.id);
  const firstImage = pages[0]?.image;

  const storycodeOf = (aiStorySuggestionId: number | undefined) =>
    entry.storySuggestions.find(
      (suggestion) => suggestion.aiStorySuggestionId === aiStorySuggestionId,
    )?.storycode;

  const image_matches = (
    firstImage?.aiStorySearchResult?.stories ?? []
  ).flatMap(({ score, aiStorySuggestion }) => {
    const storycode = storycodeOf(aiStorySuggestion?.id);
    return storycode ? [{ storycode, score }] : [];
  });

  const ocr = (firstImage?.aiOcrResult?.matches ?? []).map(
    ({ text, confidence }) => ({ text, confidence }),
  );

  const kumiko = {
    pages: pages.map(({ image }) => {
      const result = image?.aiKumikoResult;
      return result
        ? {
            rows: result.inferredStoryKindRows?.numberOfRows ?? 0,
            panels: result.detectedPanels.length,
          }
        : null;
    }),
    whole_story: !(entry.brokenpagenumerator && entry.brokenpagedenominator),
  };

  return isCover(entry)
    ? ({ image_matches, ocr, cover: true } satisfies Seed)
    : ({ image_matches, ocr, kumiko } satisfies Seed);
};

const host = () => process.env.QUACKINATOR_HOST;

const QUACKINATOR_TIMEOUT_MS = 15_000;

// Always a new engine session (sessions live in Quackinator's memory); stored answers are replayed.
export const startQuackinatorSession = async (
  indexation: FullIndexation,
  entry: FullEntry,
) => {
  if (!host()) {
    return { error: "Quackinator is not configured" };
  }
  if (!canRunOn(entry)) {
    return { error: "Quackinator only identifies comic stories and covers" };
  }
  const stored = await prisma.quackinatorSession.findUnique({
    where: { entryId: entry.id },
    include: { answers: { orderBy: { position: "asc" } } },
  });

  const seed = {
    ...evidenceFor(indexation, entry),
    facts: factsFor(indexation, entry),
    // Never ask the reader; `facts` answers it when the release date is known.
    exclude: ["decade"],
    answers: (stored?.answers ?? []).map(({ family, code, option }) => ({
      family,
      code,
      option,
    })),
  };

  let turn: Turn;
  try {
    turn = (
      await axios.post<Turn>(`${host()}/api/sessions`, seed, {
        timeout: QUACKINATOR_TIMEOUT_MS,
      })
    ).data;
  } catch (e) {
    return { error: `Could not start a Quackinator session: ${e}` };
  }

  // Answers the current index can't place (recoded character, dropped plot term) are stale.
  const dropped = new Set(turn.seed?.answers_dropped ?? []);
  if (stored && dropped.size) {
    await prisma.quackinatorAnswer.deleteMany({
      where: {
        sessionId: stored.id,
        OR: [...dropped].map((entryKey) => {
          const [family, ...rest] = entryKey.split(":");
          return { family: family as quackinatorFamily, code: rest.join(":") };
        }),
      },
    });
  }

  await prisma.quackinatorSession.upsert({
    where: { entryId: entry.id },
    create: {
      entryId: entry.id,
      remoteSessionId: turn.session_id,
      indexFingerprint: turn.seed?.index_fingerprint,
    },
    update: {
      remoteSessionId: turn.session_id,
      indexFingerprint: turn.seed?.index_fingerprint,
    },
  });

  return { turn };
};

// Only char/plot answers arrive: other questions' options change each turn.
export const recordQuackinatorAnswer = async (
  entryId: number,
  answer: { family: quackinatorFamily; code: string; option: number | null },
) => {
  const session = await prisma.quackinatorSession.findUnique({
    where: { entryId },
    include: { answers: true },
  });
  if (!session) {
    return { error: "No Quackinator session is open on this entry" };
  }
  await prisma.quackinatorAnswer.upsert({
    where: {
      sessionId_family_code: {
        sessionId: session.id,
        family: answer.family,
        code: answer.code,
      },
    },
    create: {
      ...answer,
      sessionId: session.id,
      position: session.answers.length,
    },
    update: { option: answer.option },
  });
  return { ok: true as const };
};

// Keeps the session row: story suggestions picked through it still reference it.
export const resetQuackinatorSession = async (entryId: number) => {
  await prisma.quackinatorAnswer.deleteMany({
    where: { session: { entryId } },
  });
  return { ok: true as const };
};
