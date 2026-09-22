/**
 * In-memory sliding-window rate limiter.
 *
 * The API runs as a single process, so keeping the window in memory is enough; if it is ever
 * scaled horizontally this needs to move to a shared store.
 */

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

export const createRateLimiter = ({
  windowMs,
  max,
  sweepIntervalMs = 60_000,
}: {
  windowMs: number;
  max: number;
  sweepIntervalMs?: number;
}) => {
  const hitsByKey = new Map<string, number[]>();

  const prune = (key: string, now: number) => {
    const hits = (hitsByKey.get(key) ?? []).filter(
      (hit) => now - hit < windowMs,
    );
    if (hits.length) {
      hitsByKey.set(key, hits);
    } else {
      hitsByKey.delete(key);
    }
    return hits;
  };

  // Keys of users who stopped calling would otherwise linger until their next call.
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const key of [...hitsByKey.keys()]) {
      prune(key, now);
    }
  }, sweepIntervalMs);
  sweep.unref?.();

  return {
    /** Records a hit and reports whether it is allowed. */
    check: (key: string): RateLimitResult => {
      const now = Date.now();
      const hits = prune(key, now);

      if (hits.length >= max) {
        return { allowed: false, retryAfterMs: windowMs - (now - hits[0]) };
      }

      hits.push(now);
      hitsByKey.set(key, hits);
      return { allowed: true, remaining: max - hits.length };
    },

    stop: () => clearInterval(sweep),
  };
};
