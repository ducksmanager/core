import type { FullIndexation } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";

const entrycodesWithPageNumbers = (indexation: FullIndexation) =>
  indexation.entries.map(
    (entry, idx) =>
      `${indexation.acceptedIssueSuggestion!.publicationcode} ${indexation.acceptedIssueSuggestion!.issuenumber}${
        idx === 0
          ? String.fromCharCode(97 + idx)
          : `p${String(entry.position).padStart(3, "0")}`
      }`,
  );

export default (
  indexation: FullIndexation,
  storiesWithDetails: {
    storycode: string;
    storyjobs: {
      plotwritartink: string;
      personcode: string;
    }[];
  }[],
) => {
  if (!storiesWithDetails?.length) {
    return undefined;
  } else {
    const data = indexation.entries.map((entry, idx) => {
      const storyWithDetails = storiesWithDetails.find(
        ({ storycode }) => storycode === entry.acceptedStory?.storycode,
      );
      const { storyKindRows } = entry.acceptedStoryKind!;

      return {
        entrycode: entrycodesWithPageNumbers(indexation)[idx],
        storycode: entry.acceptedStory?.storycode || "",
        pg: String(getEntryPages(indexation, entry.id).length),

        ...(Object.fromEntries(
          (["plot", "writ", "art", "ink"] as const).map((job) => [
            job,
            storyWithDetails?.storyjobs?.find(
              ({ plotwritartink }) => plotwritartink === job,
            )?.personcode,
          ]),
        ) as { plot: string; writ: string; art: string; ink: string }),

        la:
          storyKindRows.kind === "n"
            ? storyKindRows.numberOfRows
            : storyKindRows.kind,

        title: entry.title || "",
      };
    });

    return [Object.keys(data[0]), ...data.map((row) => Object.values(row))]
      .map((row) => row.join(";"))
      .join("\n");
  }
};
