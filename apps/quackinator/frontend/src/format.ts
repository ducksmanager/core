/** Entropy in bits -> how many stories are still effectively in play. */
export function candidatesLeft(entropyBits: number): number {
  return Math.max(1, Math.round(2 ** entropyBits));
}

export function formatCount(n: number, locale = "en"): string {
  return n.toLocaleString(locale);
}

// An effective count, so two significant figures unless small.
export function roughCount(n: number, locale = "en"): string {
  if (n < 100) return formatCount(n, locale);
  const step = 10 ** (Math.floor(Math.log10(n)) - 1);
  return `~${formatCount(Math.round(n / step) * step, locale)}`;
}

export function formatPercent(p: number, locale = "en"): string {
  const percent = (value: number, digits: number) =>
    value.toLocaleString(locale, {
      style: "percent",
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  if (p >= 0.995) return `>${percent(0.99, 0)}`;
  if (p < 0.001) return `<${percent(0.001, 1)}`;
  return percent(p, p < 0.1 ? 1 : 0);
}

/**
 * Inducks titles are often bare storycodes for unnamed stories; show those in a
 * monospace-ish way by flagging them to the caller.
 */
export function isBareCode(title: string, storycode: string): boolean {
  return title.trim() === storycode.trim();
}
