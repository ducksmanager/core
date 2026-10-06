import axios from "axios";

import { COVER, STORY } from "~dumili-types/storyKinds";
import { getEntryPages } from "~dumili-utils/entryPages";
import { releaseYear } from "~dumili-utils/releaseYear";
import prisma from "~prisma/client";
import type { quackinatorFamily } from "~prisma/client_dumili/client";
// Type-only, so nothing of Quackinator's frontend reaches the runtime. A
// second copy of these shapes here would be free to drift from the API
// actually being called.
import type { Seed, Turn } from "~quackinator/types";

import type { FullEntry, FullIndexation } from ".";

/**
 * Quackinator identifies a story by asking the reader ~22 questions they answer
 * by turning the pages of the magazine in their hands. Unlike the other three
 * tools it is a conversation, so it never runs on its own: the reader opens it
 * on one entry, and this module is what tells it everything Dumili already
 * knows before the first question.
 *
 * Its index covers `inducks_storyversion.kind` 'n' and 'c', which are exactly
 * Dumili's STORY and COVER — see `canRunOn`.
 */

type Fact = NonNullable<Seed["facts"]>[number];

/**
 * Tenths of a page, the unit Quackinator's length scale counts in.
 *
 * Dumili and Inducks model an entry's length the same way — whole pages plus a
 * fraction — because Dumili is filling in the same catalogue. A third of the
 * catalogue is shorter than one page, so the fraction is not a rounding detail.
 */
const pageTenths = ({
  entirepages,
  brokenpagenumerator,
  brokenpagedenominator,
}: FullEntry) =>
  entirepages * 10 +
  (brokenpagedenominator
    ? Math.round((10 * brokenpagenumerator) / brokenpagedenominator)
    : 0);

/** Quackinator's index is comic stories and covers, so nothing else can be asked about. */
export const canRunOn = (entry: FullEntry) =>
  [STORY, COVER].includes(entry.acceptedStoryKind?.storyKindRows?.kind ?? "") &&
  !entry.includedInEntryId;

const isCover = (entry: FullEntry) =>
  entry.acceptedStoryKind?.storyKindRows?.kind === COVER;

/**
 * What the indexer typed, which is as good as the entry itself. Everything the
 * tools found on the page goes in `evidenceFor` instead, for Quackinator to
 * weigh.
 */
const factsFor = (indexation: FullIndexation, entry: FullEntry): Fact[] => {
  // A cover has no length to measure: Quackinator would refuse the fact.
  const facts: Fact[] = isCover(entry)
    ? []
    : [{ key: "pages", value: pageTenths(entry) }];
  const year = releaseYear(indexation);
  if (year) {
    facts.push({ key: "decade", value: year });
  }
  return facts;
};

/**
 * Raw results of image search, OCR and Kumiko over this entry, read back from
 * what the pipeline already stored rather than re-run. Not filtered or scaled
 * here: how far each one is worth trusting is Quackinator's call, and it is the
 * one that can measure it.
 */
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

  // Kumiko segments comic panels, which a cover does not have.
  return isCover(entry)
    ? ({ image_matches, ocr, cover: true } satisfies Seed)
    : ({ image_matches, ocr, kumiko } satisfies Seed);
};

const host = () => process.env.QUACKINATOR_HOST;

const QUACKINATOR_TIMEOUT_MS = 15_000;

/**
 * Open a session on an entry, seeded with everything Dumili holds about it.
 *
 * Always a *new* engine session: Quackinator keeps its belief in process memory
 * and loses it on restart, so resuming means replaying the stored answers into
 * a fresh one rather than reaching for one that may no longer exist. That is
 * also why the seed is rebuilt every time — if Kumiko has since segmented more
 * pages, or the indexer has corrected the page count, the reader gets the
 * better session.
 */
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
    // The decade is the issue's release date, answered in `facts` when the
    // indexer has typed it. When they have not, the reader is not asked either.
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

  // Answers the engine could not place no longer mean anything — a character
  // recoded, or a plot term a rebuild dropped from the vocabulary. Keeping them
  // would replay a shrinking fraction of the session on every resume.
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

/**
 * Store one answer as the reader gives it.
 *
 * Only the character and plot families arrive here — everything else in the
 * bank is re-condensed against the live belief each turn, so its option numbers
 * would mean nothing on replay, and Dumili re-derives those answers from its
 * own database anyway.
 */
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

/** Throw the reader's answers away and let them start the entry again. */
export const resetQuackinatorSession = async (entryId: number) => {
  await prisma.quackinatorSession.deleteMany({ where: { entryId } });
  return { ok: true as const };
};
