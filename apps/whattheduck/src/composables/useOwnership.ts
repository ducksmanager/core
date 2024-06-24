export interface OwnershipWithPercentage {
  ownership: number;
  total: string;
  ownershipPercentage: number;
}

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
        ownershipPercentage: ownerships[key] ? ownerships[key] / (totals[key] || 1) : 0,
      },
    }),
    {},
  );

const getOwnershipPercentageString = (ownershipPercentage: number) =>
  ownershipPercentage === 0 ? '0' : ownershipPercentage < 0.1 / 100 ? '< 0.1' : (100 * ownershipPercentage).toFixed(1);

export const getOwnershipText = (
  { ownership, ownershipPercentage, total }: OwnershipWithPercentage,
  withPercentage = true,
): string =>
  `${ownership} ${withPercentage ? `(${getOwnershipPercentageString(ownershipPercentage)}%)` : `/ ${total}`}`;
