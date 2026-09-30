/** Mirrors the Pydantic models in src/quackinator/api/app.py. */

export interface Question {
  key: string;
  prompt: string;
  options: string[];
  /** Information this question is expected to yield. */
  gain_bits: number;
  /**
   * The Inducks page for the character this question names, for a reader who
   * does not recognise the name. Null for every question that is not about one
   * character, so the card must read fine without it.
   */
  inducks_url: string | null;
  /**
   * Inducks code of what the question is about. The stable identity — `key`
   * embeds a display name that moves with the index's DESC_LANGUAGE — so a host
   * storing an answer to replay into a later session keys it on this. Null for
   * a question about nothing nameable, and for the plot family, whose terms are
   * their own identity and travel as the label.
   */
  subject: string | null;
}

export interface Guess {
  storycode: string;
  title: string;
  year: number | null;
  probability: number;
  /**
   * Scan of the story's first page. Null where the story has no scan — 5% of
   * them — or where the mirror is switched off server-side, so every row must
   * read fine without a picture. The URL can also 404 or be blocked at load
   * time; see `GuessList`, which handles that the same way.
   */
  thumbnail_url: string | null;
}

export interface Turn {
  session_id: string;
  question: Question | null;
  guesses: Guess[];
  confidence: number;
  /** Confidence at which the engine stops asking; the full mark on the bar. */
  confidence_threshold: number;
  /**
   * Over stories. How *spread* the belief is — not how close the engine is.
   * A single answer can raise it while the leading guess improves, so this
   * drives a secondary readout, never the progress bar.
   */
  story_entropy_bits: number;
  questions_asked: number;
  done: boolean;
  /** Only on the turn that created the session, and only if it was seeded. */
  seed: SeedReport | null;
}

/** What a host system knows before the reader is asked anything. */
export interface Seed {
  /** storycode -> 0..1 confidence from the host's own tools. Lifts, never damps. */
  prior?: Record<string, number>;
  /** Measurements answering `pages`, `rows`, `cols`, `panels` or `decade`. */
  facts?: { key: string; value: number }[];
  /** What this reader answered in an earlier session, to resume it. */
  answers?: { family: string; code: string; option: number | null }[];
}

/**
 * What the seed actually did. Nothing in a seed is fatal — it is assembled
 * against an index the host does not control — so a host that wants to know
 * whether its stored data still fits has to read this.
 */
export interface SeedReport {
  prior_applied: number;
  prior_unknown: string[];
  facts_applied: string[];
  facts_rejected: string[];
  answers_replayed: number;
  answers_dropped: string[];
  index_fingerprint: string;
}

/** One name from the author box's autocomplete. */
export interface CreatorMatch {
  creator: number;
  name: string;
  /** The spelling that matched — an alias, where one did. */
  matched: string;
  stories: number;
}

export interface AnsweredQuestion {
  key: string;
  prompt: string;
  answer: string;
}
