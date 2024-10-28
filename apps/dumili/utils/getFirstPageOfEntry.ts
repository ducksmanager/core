import { FullIndexation } from "~dumili-services/indexation/types";

export const getFirstPageOfEntry = (
  indexation: FullIndexation,
  entryIdx: number,
) =>
  Math.floor(
    indexation.entries
      .filter((_, idx) => idx < entryIdx)
      .reduce(
        (acc, { entirepages, brokenpagenumerator, brokenpagedenominator }) =>
          acc + entirepages + brokenpagenumerator / brokenpagedenominator,
        0,
      ) + 1,
  );
