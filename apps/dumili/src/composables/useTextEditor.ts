export const issueColumns = [
  { field: "issuecode", formField: "issNotInInducks", width: 12 },
  { field: "h3", width: 3 },
  {
    width: 0,
    subFields: [
      { field: "title" },
      { field: "issdate", brackets: { withPrefix: true } },
      { field: "price", brackets: { withPrefix: true } },
      { field: "pages", formField: "npages", brackets: { withPrefix: true } },
      { field: "comment", brackets: { withPrefix: false } },
    ],
  },
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
  {
    width: 0,
    subFields: [
      { field: "comment", brackets: { withPrefix: false } },
      { field: "col", brackets: { withPrefix: true } },
      { field: "let", brackets: { withPrefix: true } },
      { field: "trans", brackets: { withPrefix: true } },
      { field: "xapp", brackets: { withPrefix: true } },
      { field: "desc", brackets: { withPrefix: true } },
    ],
  },
] as const;

type DumiliData<
  T extends readonly ({ width: number } & (
    | { field: string; formField?: string }
    | {
        subFields: readonly {
          field: string;
          formField?: string;
          brackets?: { withPrefix: boolean };
        }[];
      }
  ))[],
> = {
  [K in T[number] as K extends { formField: string }
    ? K["formField"]
    : K extends { field: string }
      ? K["field"]
      : K extends {
            subFields: readonly { field: string; formField?: string }[];
          }
        ? K["subFields"][number]["field"]
        : never]: K extends {
    subFields: readonly { field: string; formField?: string }[];
  }
    ? string | undefined
    : string;
};

export type DumiliIssueData = DumiliData<typeof issueColumns>;

export type DumiliEntryData = DumiliData<typeof entryColumns>;

export type DumiliOutput = [DumiliIssueData, ...DumiliEntryData[]] | [];

export default () => {
  const unText = (text?: string): DumiliOutput => {
    if (!text) return [];
    const lines = text.split("\n");
    const result = lines.map((line, idx) => {
      let pos = 0;
      const keys = idx === 0 ? issueColumns : entryColumns;
      const entries: [string, string][] = [];

      for (const key of keys) {
        if ("subFields" in key) {
          // Handle subFields case
          for (const subField of key.subFields) {
            const fieldName =
              "formField" in subField ? subField.formField : subField.field;
            entries.push([fieldName, line.slice(pos, (pos += 4)).trim()]);
          }
        } else {
          // Handle regular field case
          const fieldName = "formField" in key ? key.formField : key.field;
          entries.push([fieldName, line.slice(pos, (pos += key.width)).trim()]);
        }
      }

      return Object.fromEntries(entries);
    });
    return result as [DumiliIssueData, ...DumiliEntryData[]];
  };

  return {
    unText,
  };
};
