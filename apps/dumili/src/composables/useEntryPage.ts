import { FullIndexation } from "~dumili-services/indexation/types";

export default (indexation: Ref<FullIndexation>) => {
  const getFirstPageOfEntry = (entryIdx: number) =>
    Math.floor(
      indexation.value.entries
        .filter((_, idx) => idx < entryIdx)
        .reduce(
          (acc, { entirepages, brokenpagenumerator, brokenpagedenominator }) =>
            acc + entirepages + brokenpagenumerator / brokenpagedenominator,
          0,
        ) + 1,
    );

  return { getFirstPageOfEntry };
};
