import axios from "axios";

import { STORY } from "~dumili-types/storyKinds";
import {
  imageSearchConfidence,
  ocrConfidence,
} from "~dumili-utils/aiSuggestionConfidence";
import { getEntryPages } from "~dumili-utils/entryPages";
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
 * Its index only covers `inducks_storyversion.kind = 'n'`, which is exactly
 * Dumili's STORY — see `canRunOn`.
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

/** Quackinator's index is comic stories only, so nothing else can be asked about. */
export const canRunOn = (entry: FullEntry) =>
  entry.acceptedStoryKind?.storyKindRows?.kind === STORY &&
  !entry.includedInEntryId;

/**
 * Rows of panels on a typical page, from Kumiko, or null where nothing was
 * segmented.
 *
 * The median across the entry's scanned pages rather than the first page's
 * count: a splash page or a final page carrying half a story is normal, and one
 * of those as the answer would be a wrong answer rather than a missing one —
 * which costs far more. Pages with no image at all are simply absent, because
 * an indexer may be working from a PDF, a handful of scans, or nothing.
 */
const inferredRows = (indexation: FullIndexation, entry: FullEntry) => {
  const counts = getEntryPages(indexation, entry.id)
    .map(
      (page) => page.image?.aiKumikoResult?.inferredStoryKindRows?.numberOfRows,
    )
    .filter((rows): rows is number => !!rows)
    .sort((a, b) => a - b);
  return counts.length ? counts[Math.floor(counts.length / 2)] : null;
};

/**
 * Total panels in the story, from Kumiko.
 *
 * Only where *every* page of the entry was segmented: a total is a sum, so a
 * missing page does not make it approximate, it makes it wrong — and a story
 * counted short is an answer that pushes the true story down rather than one
 * that merely fails to lift it.
 */
const inferredPanels = (indexation: FullIndexation, entry: FullEntry) => {
  const pages = getEntryPages(indexation, entry.id);
  const segmented = pages.filter((page) => page.image?.aiKumikoResult);
  if (!pages.length || segmented.length !== pages.length) {
    return null;
  }
  return segmented.reduce(
    (total, page) =>
      total + (page.image!.aiKumikoResult!.detectedPanels.length ?? 0),
    0,
  );
};

/** The year printed on the magazine, which the indexer is holding. */
const releaseYear = (indexation: FullIndexation) => {
  const year = Number((indexation.releaseDate ?? "").slice(0, 4));
  // Inducks' own decade scale starts in the 1830s; anything below is a typo
  // rather than a date, and Quackinator would decline it anyway.
  return year >= 1830 && year <= 2100 ? year : null;
};

/**
 * What reverse image search and OCR already believe, as `{storycode: 0..1}`.
 *
 * Both tools have already written their candidates against this entry's first
 * page, so this reads them back rather than re-running anything. A story found
 * by both keeps the higher confidence: the two fail independently, so one
 * missing it is not evidence against the other.
 *
 * Everything here only ever lifts a story. A shortlist that misses the reader's
 * costs them a few percent of their belief mass and nothing more, which is why
 * it can be taken seriously at all — but a *confidently wrong* one lands them
 * on a guess they have to reject, so both scales are gated above.
 */
const priorFromOtherTools = (indexation: FullIndexation, entry: FullEntry) => {
  const image = getEntryPages(indexation, entry.id)[0]?.image;
  if (!image) {
    return {};
  }

  const storycodeOf = (aiStorySuggestionId: number | null | undefined) =>
    entry.storySuggestions.find(
      (suggestion) => suggestion.aiStorySuggestionId === aiStorySuggestionId,
    )?.storycode;

  const confidences: Record<string, number> = {};
  const offer = (storycode: string | undefined, confidence: number) => {
    if (!storycode) {
      return;
    }
    confidences[storycode] = Math.max(confidences[storycode] ?? 0, confidence);
  };

  for (const story of image.aiStorySearchResult?.stories ?? []) {
    const confidence = imageSearchConfidence(story.score);
    if (confidence !== null) {
      offer(storycodeOf(story.aiStorySuggestion?.id), confidence);
    }
  }

  const ocrStories = image.aiOcrResult?.stories ?? [];
  const best = Math.max(...ocrStories.map(({ score }) => score), 0);
  for (const story of ocrStories) {
    const confidence = ocrConfidence(story.score, best);
    if (confidence !== null) {
      offer(storycodeOf(story.aiStorySuggestion?.id), confidence);
    }
  }

  return confidences;
};

/**
 * Measurements Dumili can answer without spending one of the reader's turns.
 *
 * `pages` and `decade` come from what the indexer typed, so they are as good as
 * the entry itself. `rows` and `panels` come from Kumiko, which is computer
 * vision over whatever pages happen to be scanned — a wrong answer there is far
 * more expensive than a missing one, so both are gated on
 * `QUACKINATOR_TRUST_KUMIKO` until that error rate has been measured.
 */
const factsFor = (indexation: FullIndexation, entry: FullEntry): Fact[] => {
  const facts: Fact[] = [{ key: "pages", value: pageTenths(entry) }];

  const year = releaseYear(indexation);
  if (year) {
    facts.push({ key: "decade", value: year });
  }

  if (process.env.QUACKINATOR_TRUST_KUMIKO === "true") {
    const rows = inferredRows(indexation, entry);
    if (rows) {
      facts.push({ key: "rows", value: rows });
    }
    const panels = inferredPanels(indexation, entry);
    if (panels) {
      facts.push({ key: "panels", value: panels });
    }
  }

  return facts;
};

const host = () => process.env.QUACKINATOR_HOST;

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
    return { error: "Quackinator only identifies comic stories" };
  }

  const stored = await prisma.quackinatorSession.findUnique({
    where: { entryId: entry.id },
    include: { answers: { orderBy: { position: "asc" } } },
  });

  const seed = {
    prior: priorFromOtherTools(indexation, entry),
    facts: factsFor(indexation, entry),
    answers: (stored?.answers ?? []).map(({ family, code, option }) => ({
      family,
      code,
      option,
    })),
  };

  let turn: Turn;
  try {
    turn = (await axios.post<Turn>(`${host()}/api/sessions`, seed)).data;
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
