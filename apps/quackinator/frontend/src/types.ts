/** Mirrors the Pydantic models in src/quackinator/api/app.py. */

/** English template + params, translated by `useQuackinatorI18n`. */
export interface Message {
  id: string;
  params: Record<string, string>;
}

export interface Question {
  key: string;
  prompt: string;
  options: string[];
  prompt_message: Message;
  option_messages: Message[];
  gain_bits: number;
  inducks_url: string | null;
  /** Stable Inducks code to store answers under (`key` embeds a localised name). Null for plot questions. */
  subject: string | null;
}

export interface Guess {
  storycode: string;
  title: string;
  year: number | null;
  probability: number;
  thumbnail_url: string | null;
}

export interface Turn {
  session_id: string;
  question: Question | null;
  guesses: Guess[];
  confidence: number;
  /** Confidence at which the engine stops asking. */
  confidence_threshold: number;
  /** Not monotone, so never used for the progress bar. */
  story_entropy_bits: number;
  questions_asked: number;
  done: boolean;
  cover: boolean;
  /** Only on the first turn of a seeded session. */
  seed: SeedReport | null;
}

export interface Seed {
  /** storycode -> 0..1 confidence from the host's own tools. Lifts, never damps. */
  prior?: Record<string, number>;
  /** Answers to `pages`, `rows`, `cols`, `panels` or `decade`. */
  facts?: { key: string; value: number }[];
  answers?: { family: string; code: string; option: number | null }[];
  image_matches?: { storycode: string; score: number }[];
  ocr?: OcrText[];
  kumiko?: KumikoEvidence | null;
  /** Questions never to ask, after `facts` has answered what it can. */
  exclude?: string[];
  cover?: boolean;
}

export interface OcrText {
  text: string;
  confidence: number;
}

export interface KumikoEvidence {
  /** One per page, null where unsegmented. */
  pages: ({ rows: number; panels: number } | null)[];
  /** `pages` covers the whole story, so panels can be totalled. */
  whole_story?: boolean;
}

export interface Analysis {
  kumiko: KumikoEvidence;
  ocr: OcrText[];
}

/** What the seed actually applied; unusable parts are dropped, not errors. */
export interface SeedReport {
  prior_applied: number;
  prior_unknown: string[];
  facts_applied: string[];
  facts_rejected: string[];
  answers_replayed: number;
  answers_dropped: string[];
  image_applied: number;
  image_unknown: string[];
  /** Null where the index carries no titles to match OCR against. */
  ocr_words: string[] | null;
  kumiko_applied: string[];
  index_fingerprint: string;
}

export interface CreatorMatch {
  creator: number;
  name: string;
  /** The spelling that matched, possibly an alias. */
  matched: string;
  stories: number;
}

export interface AnsweredQuestion {
  key: string;
  prompt: Message;
  answer: Message;
}
