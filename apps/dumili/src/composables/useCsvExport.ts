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

export const getCsvError = (
  indexation: FullIndexation,
  storiesWithDetails: StoriesWithDetails | undefined,
  t: ReturnType<typeof useI18n>["t"],
) => {
  if (!storiesWithDetails || !Object.keys(storiesWithDetails).length) {
    return t("Vous devez identifier au moins une histoire pour continuer");
  }
  const firstEntryWithoutStoryKind = indexation.entries.find(
    (entry) => !entry.acceptedStoryKind,
  );
  if (firstEntryWithoutStoryKind) {
    return t(
      "Toutes les entrées doivent avoir un type. L'entrée à la page {entry} n'a pas de type.",
      {
        entry: firstEntryWithoutStoryKind.position,
      },
    );
  }
};

export const getCsvEntries = (
  indexation: FullIndexation,
  storiesWithDetails: StoriesWithDetails,
  t: ReturnType<typeof useI18n>["t"],
) => {
  if (getCsvError(indexation, storiesWithDetails, t)) {
    return undefined;
  }
  const data = indexation.entries.map((entry, idx) => {
    const storyWithDetails =
      storiesWithDetails[entry.acceptedStory?.storycode || ""];
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
};
