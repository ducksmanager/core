import type { FullIndexation } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";

const issuenumberWithoutCountry = (
  acceptedIssueSuggestion: NonNullable<
    FullIndexation["acceptedIssueSuggestion"]
  >,
) =>
  `${acceptedIssueSuggestion.publicationcode.split("/")[1]} ${acceptedIssueSuggestion.issuenumber}`;

const entrycodesWithPageNumbers = (indexation: FullIndexation) => {
  const pageNumberPadding = String(indexation.pages.length).length;
  return indexation.entries.map(
    (entry, idx) =>
      `${issuenumberWithoutCountry(indexation.acceptedIssueSuggestion!)}${
        idx === 0
          ? String.fromCharCode(97 + idx)
          : `p${String(entry.position).padStart(pageNumberPadding, "0")}`
      }`,
  );
};

export const getCsvMetadata = (indexation: FullIndexation) =>
  ({
    issuecode: issuenumberWithoutCountry(indexation.acceptedIssueSuggestion!),
    issdate: indexation.releaseDate,
    title: indexation.title || undefined,
    price: indexation.price || undefined,
    issue_comment: Object.entries({
      title: indexation.title,
      pages: indexation.pages.length,
    })
      .map(([key, value]) => `[${key}:${value}]`)
      .join(" "),
  }) as {
    issuecode: string;
    issdate: string;
    title?: string;
    price?: string;
    issue_comment?: string;
  };

export const getCsvEntries = (
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
        pages: String(getEntryPages(indexation, entry.id).length),

        ...(Object.fromEntries(
          (["plot", "writ", "art", "ink"] as const).map((job) => [
            job,
            storyWithDetails?.storyjobs?.find(
              ({ plotwritartink }) => plotwritartink === job,
            )?.personcode,
          ]),
        ) as { plot: string; writ: string; art: string; ink: string }),

        pagel:
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
