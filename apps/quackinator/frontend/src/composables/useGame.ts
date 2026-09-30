import { computed, ref, shallowRef } from "vue";

import { api as defaultApi, ApiError, type Api } from "~quackinator/api";
import type {
  AnsweredQuestion,
  CreatorMatch,
  Guess,
  Question,
  Seed,
  Turn,
} from "~quackinator/types";

/** One answer, as a host needs it to store and replay later. */
export interface AnswerEvent {
  key: string;
  /** `char` or `plot`, or null for anything outside the two families. */
  family: string | null;
  /**
   * The stable identity to store this under: an Inducks character code, or the
   * plot term itself. Null for a question that is not a family question —
   * those are never stored, because their options are re-condensed against the
   * live belief each turn, so an index means nothing afterwards.
   */
  code: string | null;
  /** Index into the question's options; null is "don't know". */
  option: number | null;
}

export interface GameOptions {
  /** Which API to talk to. Defaults to the standalone app's own origin. */
  api?: Api;
  /**
   * Adopt a session someone else created — a host that seeded it server-side,
   * where it has the database to seed from. The whole turn is handed over
   * rather than an id, because nothing re-reads a session, and a host
   * reopening one builds a fresh seeded session anyway.
   */
  initialTurn?: Turn;
  /**
   * Called for every answer as it is given, so a host can persist it. Fires
   * before the turn comes back: what it reports is what the reader said, not
   * what the engine made of it.
   */
  onAnswered?: (answer: AnswerEvent) => void;
}

/**
 * All game state lives here. The backend holds the belief vector; the frontend
 * holds only the session id and what the reader has been shown so far.
 */
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
  const done = ref(false);
  const busy = ref(false);
  const error = ref<string | null>(null);
  /**
   * The author box is offered once, before the questions, and then retired —
   * whether the reader used it or waved it away. It is not a question and never
   * costs a turn, which is the whole reason it can be offered at all: most
   * printings carry no credit, and for those readers dismissing it is free.
   */
  const creatorOffered = ref(true);

  const started = computed(() => sessionId.value !== null);

  /**
   * How close the engine is to committing, as a fraction of the confidence it
   * needs to stop asking.
   *
   * Deliberately *not* derived from `storyEntropyBits`. That is perplexity — how
   * spread the belief is — and Bayesian updating does not make it monotone: an
   * answer that rules out a concentrated group and leaves a diffuse one raises
   * it even as the leading guess improves.
   *
   * Measured over 1,255 answered questions in 60 honest sessions:
   *
   *   perplexity moved backwards on 17% of answers, and in 100% of those the
   *   true story's rank held or improved — every one a false alarm
   *   confidence moves backwards on 8%, and 98% of those are a change of
   *   leading story
   *
   * So this still falls sometimes, and that is the point: it falls when the
   * engine abandons its best guess, which is a real event the reader should see.
   * Do not clamp it to a running maximum — that would hide exactly the thing it
   * is here to report.
   */
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
    absorb(turn);
    startingBits.value = turn.story_entropy_bits;
  };

  const start = async (seed?: Seed) => {
    if (options.initialTurn && !sessionId.value) {
      // Already paid for by whoever created the session.
      adopt(options.initialTurn);
      return;
    }
    await guard(async () => adopt(await api.start(seed)));
  };

  /** `option` is an index into the current question's options; null = don't know. */
  const answer = async (option: number | null) => {
    const current = question.value;
    const id = sessionId.value;
    if (!current || !id) return;
    const [family] = current.key.split(":");
    const isFamily = family === "char" || family === "plot";
    options.onAnswered?.({
      key: current.key,
      family: isFamily ? family : null,
      // A character travels as its code; a plot term is its own identity and
      // the API sends no subject for it.
      code: isFamily
        ? (current.subject ?? current.key.slice(family.length + 1))
        : null,
      option,
    });
    await guard(async () => {
      const turn = await api.answer(id, current.key, option);
      trail.value.push({
        key: current.key,
        prompt: current.prompt,
        answer:
          option === null ? "Don't know" : (current.options[option] ?? "?"),
      });
      absorb(turn);
    });
  };

  /** Autocomplete. Deliberately outside `guard` so typing never blocks a turn. */
  const searchCreators = (query: string): Promise<CreatorMatch[]> =>
    api.creators(query).catch(() => []);

  const nameCreator = async (match: CreatorMatch) => {
    const id = sessionId.value;
    if (!id) return;
    await guard(async () => {
      const turn = await api.nameCreator(id, match.creator);
      trail.value.push({
        key: "creator",
        prompt: "Whose name is printed on the story's first page?",
        answer: match.name,
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

  const restart = async () => {
    const id = sessionId.value;
    if (id) void api.end(id).catch(() => undefined);
    sessionId.value = null;
    await guard(async () => adopt(await api.start()));
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
    done,
    busy,
    error,
    started,
    progress,
    creatorOffered,
    adopt,
    start,
    answer,
    searchCreators,
    nameCreator,
    dismissCreator,
    reject,
    restart,
  };
};
