export type OwnershipWithPercentage = { ownership: number; total: string; ownershipPercentage: number };

export const getOwnershipPercentages = (
  ownerships: Record<string, number> | undefined,
  totals: Record<string, number> | undefined,
): Record<string, OwnershipWithPercentage> | undefined =>
  ownerships &&
  totals &&
  Object.keys(totals).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        total: totals[key],
        ownership: ownerships[key] || 0,
        ownershipPercentage: ownerships[key] ? Math.max(0.1 / 100, ownerships[key] / (totals[key] || 1)) : 0,
      },
    }),
    {},
  );

export const getOwnershipText = (
  { ownership, ownershipPercentage, total }: OwnershipWithPercentage,
  withPercentage: boolean = true,
): string =>
  withPercentage
    ? `${ownership} (${ownershipPercentage! < 0.1 ? '< 0.1' : (100 * ownershipPercentage)!.toFixed(1)}%)`
    : `${ownership} / ${total}`;
