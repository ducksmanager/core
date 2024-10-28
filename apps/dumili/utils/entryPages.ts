import type { FullIndexation } from "~dumili-services/indexation/types";

export const getFirstPageOfEntry = (
  indexation: FullIndexation,
  entryId: number,
) =>
  Math.floor(
    indexation.entries
      .filter(
        (_, idx) =>
          idx < indexation.entries.map(({ id }) => id).indexOf(entryId),
      )
      .reduce(
        (acc, { entirepages, brokenpagenumerator, brokenpagedenominator }) =>
          acc + entirepages + brokenpagenumerator / brokenpagedenominator,
        0,
      ) + 1,
  );

export const getEntryPages = (indexation: FullIndexation, entryId: number) => {
  const firstPageOfEntry = getFirstPageOfEntry(indexation, entryId);
  const entry = indexation.entries.find(({ id }) => id === entryId)!;
  return indexation.pages.slice(
    firstPageOfEntry - 1,
    firstPageOfEntry + entry.entirepages - 1,
  );
};
