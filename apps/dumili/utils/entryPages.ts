import type { entry, page } from "~prisma/client_dumili";

export const getFirstPageOfEntry = (entries: entry[], entryId: number) =>
  Math.floor(
    entries
      .filter((_, idx) => idx < entries.map(({ id }) => id).indexOf(entryId))
      .reduce(
        (acc, { entirepages, brokenpagenumerator, brokenpagedenominator }) =>
          acc + entirepages + brokenpagenumerator / brokenpagedenominator,
        0,
      ),
  );

export const getEntryPages = <P extends page>(
  { entries, pages }: { entries: entry[]; pages: P[] },
  entryId: number,
) => {
  const firstPageOfEntry = getFirstPageOfEntry(entries, entryId);
  const entry = entries.find(({ id }) => id === entryId)!;
  return pages.slice(firstPageOfEntry, firstPageOfEntry + entry.entirepages);
};

export const getEntryFromPage = <E extends entry, P extends page>(
  { entries, pages }: { entries: E[]; pages: P[] },
  pageId: page["id"],
) =>
  entries.find(({ id }) =>
    getEntryPages({ entries, pages }, id).some(({ id }) => id === pageId),
  );
