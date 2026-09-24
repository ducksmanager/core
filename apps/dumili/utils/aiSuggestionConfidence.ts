/**
 * Putting the two automatic tools' scores on one scale.
 *
 * They do not share one. Image search reports `1 - cosine_distance` having
 * already discarded anything past 0.15 distance, so what arrives is in
 * `[0.85, 1]` and is already a confidence. OCR's is a raw MySQL fulltext
 * relevance from `MATCH(title) AGAINST(...)`: unbounded, uncalibrated, and
 * routinely above 1 — so it cannot be read as a confidence at all, only
 * compared against other results for the same entry.
 *
 * Both callers need the same answer: the API to decide what to seed a
 * Quackinator session with, and the wizard to rank the suggestions it shows
 * before the first question. Kept free of imports so both can have it — a copy
 * on either side would be free to drift, and then the list a reader sees would
 * disagree with the belief the engine starts from.
 */

/** Image search is gated on its own number, which is already a confidence. */
export const MIN_IMAGE_CONFIDENCE = 0.9;

/** OCR is gated on how it compares to the best match for the same entry. */
export const MIN_OCR_RELATIVE_SCORE = 0.5;

/**
 * Ceiling for anything OCR-derived, deliberately below what image search can
 * reach: a title matching words the OCR happened to read is far weaker
 * evidence than the drawing itself matching.
 */
export const MAX_OCR_CONFIDENCE = 0.6;

/** Null where the match is too weak to be worth showing or seeding. */
export const imageSearchConfidence = (score: number): number | null =>
  score >= MIN_IMAGE_CONFIDENCE ? Math.min(score, 1) : null;

/**
 * `best` is the highest OCR score for the same entry. Null where the score is
 * too far off that best, or where there is nothing to compare against.
 */
export const ocrConfidence = (score: number, best: number): number | null => {
  if (best <= 0) {
    return null;
  }
  const relative = score / best;
  return relative >= MIN_OCR_RELATIVE_SCORE
    ? relative * MAX_OCR_CONFIDENCE
    : null;
};
