export const issueColumns = [
  { field: "issuecodeNoCountry", formField: "issNotInInducks", width: 12 },
  { field: "h3", width: 3 },
  { field: "header", width: Infinity },
] as const;

export const entryColumns = [
  { field: "entrycode", width: 12 },
  { field: "storycode", width: 14 },
  { field: "pg", width: 3, formField: "page1" },
  { field: "la", formField: "pagel1", width: 2 },
  { field: "_", width: 1 },
  { field: "plot", width: 4 },
  { field: "writer", width: 4 },
  { field: "artist", width: 4 },
  { field: "ink", width: 4 },
  { field: "hero", width: 4 },
  { field: "title", width: 4 },
] as const;

type DumiliData<
  T extends readonly { field: string; formField?: string; width: number }[],
> = {
  [K in T[number] as K["formField"] extends string
    ? K["formField"]
    : K["field"]]: string;
};

export type DumiliIssueData = DumiliData<typeof issueColumns>;

export type DumiliEntryData = DumiliData<typeof entryColumns>;

export default () => {
  const unText = (
    text?: string,
  ): [DumiliIssueData, ...DumiliEntryData[]] | [] => {
    if (!text) return [];
    const lines = text.split("\n");
    const result = lines.map((line, idx) => {
      let pos = 0;
      const keys = idx === 0 ? issueColumns : entryColumns;
      return Object.fromEntries(
        keys.map(({ width, field, ...rest }) => [
          "formField" in rest ? rest.formField : field,
          line.slice(pos, (pos += width)).trim(),
        ]),
      );
    });
    return result as [DumiliIssueData, ...DumiliEntryData[]];
  };

  return {
    unText,
  };
};
