import type { FullIndexation } from "~dumili-services/indexation/types";
import type { entry } from "~prisma/client_dumili";

export const getFirstPageOfEntry = (entries: entry[], entryId: number) =>
  Math.floor(
    entries
      .filter((_, idx) => idx < entries.map(({ id }) => id).indexOf(entryId))
      .reduce(
        (acc, { entirepages, brokenpagenumerator, brokenpagedenominator }) =>
          acc + entirepages + brokenpagenumerator / brokenpagedenominator,
        0,
      ) + 1,
  );

export const getEntryPages = (
  { entries, pages }: Pick<FullIndexation, "entries" | "pages">,
  entryId: number,
) => {
  const firstPageOfEntry = getFirstPageOfEntry(entries, entryId);
  const entry = entries.find(({ id }) => id === entryId)!;
  return pages.slice(
    firstPageOfEntry - 1,
    firstPageOfEntry + entry.entirepages - 1,
  );
};
