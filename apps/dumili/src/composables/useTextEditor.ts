export default () => {
  const columnWidths = [12, 14, 3, 2, 1, 4, 4, 4, 4, 4];

  const keys = [
    "entrycode",
    "storycode",
    "pg",
    "la",
    "_",
    "plot",
    "writer",
    "artist",
    "ink",
    "hero",
    "title",
  ] as const;

  const unText = (text?: string) => {
    if (!text) return [];
    return text.split("\n").map((line) => {
      let pos = 0;
      return Object.fromEntries(
        keys.map((key) => [
          key,
          line.slice(pos, (pos += columnWidths[keys.indexOf(key)])).trim(),
        ]),
      ) as Record<(typeof keys)[number], string>;
    });
  };

  return {
    columnWidths,
    unText,
  };
};
