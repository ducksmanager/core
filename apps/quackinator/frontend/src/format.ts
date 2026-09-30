/** Entropy in bits -> how many stories are still effectively in play. */
export function candidatesLeft(entropyBits: number): number {
  return Math.max(1, Math.round(2 ** entropyBits));
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * An *effective* count — 2**entropy, not a tally of rows — so rendering it to
 * the unit ("6,912 stories") claims precision it does not have. Two significant
 * figures and a tilde, exact only where the number is small enough to mean
 * something literal.
 */
export function roughCount(n: number): string {
  if (n < 100) return formatCount(n);
  const step = 10 ** (Math.floor(Math.log10(n)) - 1);
  return `~${formatCount(Math.round(n / step) * step)}`;
}

export function formatPercent(p: number): string {
  if (p >= 0.995) return ">99%";
  if (p < 0.001) return "<0.1%";
  return `${(p * 100).toFixed(p < 0.1 ? 1 : 0)}%`;
}

/**
 * Inducks titles are often bare storycodes for unnamed stories; show those in a
 * monospace-ish way by flagging them to the caller.
 */
export function isBareCode(title: string, storycode: string): boolean {
  return title.trim() === storycode.trim();
}
