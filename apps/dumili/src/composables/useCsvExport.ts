import type { FullIndexation } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";
import type { SuccessfulEventOutput } from "socket-call-client";
import type { ClientEvents as CoaEvents } from "~dm-services/coa";

export type StoriesWithDetails = Record<
  string,
  {
    storycode: string;
    heroCharacter:
      | SuccessfulEventOutput<
          CoaEvents,
          "getStoriesHeroCharacter"
        >["data"][string]
      | null;
    storyjobs: SuccessfulEventOutput<
      CoaEvents,
      "getStoriesStoryjobs"
    >["data"][string];
  }
>;

const issuenumberWithoutCountry = (
  acceptedIssueSuggestion: NonNullable<
    FullIndexation["acceptedIssueSuggestion"]
  >,
) => {
  const { publicationcode, issuenumber } = acceptedIssueSuggestion;
  const shortPublicationcode = publicationcode.split("/")[1];
  return `${shortPublicationcode}${Array.from({ length: 8 - (shortPublicationcode.length + issuenumber.length) }, () => " ").join("")}${issuenumber}`;
};

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
    price: indexation.price || undefined,
    issue_comment:
      (indexation.title ? `${indexation.title} ` : "") +
      Object.entries({
        pages: indexation.pages.length,
      })
        .map(([key, value]) => `[${key}:${value}]`)
        .join(" "),
  }) as {
    issuecode: string;
    issdate: string;
    price?: string;
    issue_comment?: string;
  };

export const getCsvEntries = (
  indexation: FullIndexation,
  storiesWithDetails: StoriesWithDetails,
) => {
  if (!Object.keys(storiesWithDetails).length) {
    return undefined;
  } else {
    const data = indexation.entries.map((entry, idx) => {
      const storyWithDetails =
        storiesWithDetails[entry.acceptedStory?.storycode || ""] || undefined;
      const { storyKindRows } = entry.acceptedStoryKind!;

      return {
        entrycode: entrycodesWithPageNumbers(indexation)[idx],
        storycode: entry.acceptedStory?.storycode || "",
        hero: storyWithDetails?.heroCharacter || "",
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
