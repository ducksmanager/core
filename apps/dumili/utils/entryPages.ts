import type { entry, page } from "~prisma/client_dumili";

export const getFirstPageOfEntry = (entries: entry[], entryId: number) =>
  entries.find((entry) => entry.id === entryId)!.position - 1;

export const getEntryPages = <P extends page>(
  { entries, pages }: { entries: entry[]; pages: P[] },
  entryId: number,
) => {
  const entry = entries.find(({ id }) => id === entryId)!;
  return pages.slice(
    entry.position - 1,
    entry.position + entry.entirepages - 1,
  );
};

export const getEntryFromPage = <E extends entry, P extends page>(
  { entries, pages }: { entries: E[]; pages: P[] },
  pageId: page["id"],
) => {
  const { pageNumber } = pages.find(({ id }) => pageId === id)!;
  return entries.find(
    ({ position, entirepages }) =>
      position <= pageNumber && position + entirepages > pageNumber,
  );
};
