import { computed, ref, shallowRef } from "vue";

import { api as defaultApi, ApiError, type Api } from "~quackinator/api";
import type {
  AnsweredQuestion,
  CreatorMatch,
  Guess,
  Question,
  Seed,
  SeedReport,
  Turn,
} from "~quackinator/types";

/** One answer, as a host needs it to store and replay later. */
export interface AnswerEvent {
  key: string;
  family: string | null;
  /** Character code or plot term. Null for non-family questions: their options change each turn, so they can't be replayed. */
  code: string | null;
  /** null = don't know */
  option: number | null;
}

export interface GameOptions {
  api?: Api;
  /** First turn of a session the host already created. */
  initialTurn?: Turn;
  onAnswered?: (answer: AnswerEvent) => void;
}

const seedApplied = (report: SeedReport | null) =>
  !!report &&
  (report.prior_applied > 0 ||
    report.facts_applied.length > 0 ||
    report.answers_replayed > 0 ||
    report.image_applied > 0 ||
    (report.ocr_words?.length ?? 0) > 0 ||
    report.kumiko_applied.length > 0);

export const useGame = (options: GameOptions = {}) => {
  const api = options.api ?? defaultApi;
  const sessionId = ref<string | null>(null);
  const question = shallowRef<Question | null>(null);
  const guesses = shallowRef<Guess[]>([]);
  const trail = ref<AnsweredQuestion[]>([]);
  const confidence = ref(0);
  const confidenceThreshold = ref(1);
  const storyEntropyBits = ref(0);
  const startingBits = ref(0);
  const questionsAsked = ref(0);
  const seeded = ref(false);
  const done = ref(false);
  const cover = ref(false);
  const busy = ref(false);
  const error = ref<string | null>(null);
  // Offered once before the questions, then retired whether used or dismissed.
  const creatorOffered = ref(true);

  const started = computed(() => sessionId.value !== null);

  // confidence / threshold, not entropy: entropy can rise after a good answer.
  // Don't clamp to a running max.
  const progress = computed(() => {
    if (!confidenceThreshold.value) return 0;
    return Math.min(
      1,
      Math.max(0, confidence.value / confidenceThreshold.value),
    );
  });

  const absorb = (turn: Turn) => {
    sessionId.value = turn.session_id;
    question.value = turn.question;
    guesses.value = turn.guesses;
    confidence.value = turn.confidence;
    confidenceThreshold.value = turn.confidence_threshold;
    storyEntropyBits.value = turn.story_entropy_bits;
    questionsAsked.value = turn.questions_asked;
    done.value = turn.done;
    cover.value = turn.cover;
  };

  const guard = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (busy.value) return undefined;
    busy.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : String(e);
      return undefined;
    } finally {
      busy.value = false;
    }
  };

  const adopt = (turn: Turn) => {
    trail.value = [];
    creatorOffered.value = true;
    seeded.value = seedApplied(turn.seed);
    absorb(turn);
    startingBits.value = turn.story_entropy_bits;
  };

  const start = async (seed?: Seed) => {
    if (options.initialTurn && !sessionId.value) {
      adopt(options.initialTurn);
      return;
    }
    await guard(async () => adopt(await api.start(seed)));
  };

  const answer = async (option: number | null) => {
    const current = question.value;
    const id = sessionId.value;
    if (!current || !id) return;
    const [family] = current.key.split(":");
    const isFamily = family === "char" || family === "plot";
    const event: AnswerEvent = {
      key: current.key,
      family: isFamily ? family : null,
      // Plot questions have no subject; the term itself is the identity.
      code: isFamily
        ? (current.subject ?? current.key.slice(family.length + 1))
        : null,
      option,
    };
    await guard(async () => {
      const turn = await api.answer(id, current.key, option);
      // Only after the engine accepted it, so refused answers aren't persisted.
      options.onAnswered?.(event);
      trail.value.push({
        key: current.key,
        prompt: current.prompt_message,
        answer:
          option === null
            ? { id: "Don't know", params: {} }
            : (current.option_messages[option] ?? { id: "?", params: {} }),
      });
      absorb(turn);
    });
  };

  // Outside `guard` so typing never blocks a turn.
  const searchCreators = (query: string): Promise<CreatorMatch[]> =>
    api.creators(query).catch(() => []);

  const nameCreator = async (match: CreatorMatch) => {
    const id = sessionId.value;
    if (!id) return;
    await guard(async () => {
      const turn = await api.nameCreator(id, match.creator);
      trail.value.push({
        key: "creator",
        prompt: {
          id: cover.value
            ? "Whose name is printed on the cover?"
            : "Whose name is printed on the story's first page?",
          params: {},
        },
        answer: { id: "{text}", params: { text: match.name } },
      });
      creatorOffered.value = false;
      absorb(turn);
    });
  };

  const dismissCreator = () => {
    creatorOffered.value = false;
  };

  const reject = async (storycode: string) => {
    const id = sessionId.value;
    if (!id) return;
    await guard(async () => absorb(await api.reject(id, storycode)));
  };

  return {
    question,
    guesses,
    trail,
    confidence,
    confidenceThreshold,
    storyEntropyBits,
    startingBits,
    questionsAsked,
    seeded,
    done,
    cover,
    busy,
    error,
    started,
    progress,
    creatorOffered,
    start,
    answer,
    searchCreators,
    nameCreator,
    dismissCreator,
    reject,
  };
};
