import type { FullIndexation } from "~dumili-services/indexation";
import { getEntryPages } from "~dumili-utils/entryPages";
import type { EventOutput } from "socket-call-client";
import type { ClientEvents as CoaEvents } from "~dm-services/coa";
import type { Reactive } from "vue";

export const buildStoriesWithDetails = (
  storycodes: string[],
  storyjobs: EventOutput<CoaEvents, "getStoriesStoryjobs">,
  heroCharacter: EventOutput<CoaEvents, "getStoriesHeroCharacter">,
) => {
  const storiesStoryjobs = "error" in storyjobs ? {} : storyjobs.data;
  const heroCharacters = "error" in heroCharacter ? {} : heroCharacter.data;
  return storycodes
    .map((storycode) => ({
      storycode,
      heroCharacter:
        storycode in heroCharacters ? heroCharacters[storycode] : null,
      storyjobs:
        storycode in storiesStoryjobs ? storiesStoryjobs[storycode] : [],
    }))
    .groupBy("storycode");
};

export type StoriesWithDetails = ReturnType<typeof buildStoriesWithDetails>;

const issuenumberWithoutCountry = (
  acceptedIssueSuggestion: NonNullable<
    FullIndexation["acceptedIssueSuggestion"]
  >,
) => {
  const { publicationcode, issuenumber } = acceptedIssueSuggestion;
  const shortPublicationcode = publicationcode.split("/")[1];
  return `${shortPublicationcode}${Array.from({ length: 8 - (shortPublicationcode.length + issuenumber.length) }, () => " ").join("")}${issuenumber}`;
};

export default (
  indexation: Reactive<FullIndexation>,
  storiesWithDetails: Reactive<StoriesWithDetails>,
  t: ReturnType<typeof useI18n>["t"],
) => {
  const pageNumberPadding = computed(
    () => String(indexation.pages.length).length,
  );
  const entrycodesWithPageNumbers = computed(() =>
    indexation.entries.map(
      (entry, i) =>
        `${issuenumberWithoutCountry(indexation.acceptedIssueSuggestion!)}${
          i === 0
            ? String.fromCharCode(97 + i)
            : `p${String(entry.position).padStart(pageNumberPadding.value, "0")}`
        }`,
    ),
  );

  const csvMetadata = computed(() => ({
    issuecode: issuenumberWithoutCountry(indexation.acceptedIssueSuggestion!),
    issdate: indexation.releaseDate,
    price: indexation.price || undefined,
    issue_comment:
      (indexation.title ? `${indexation.title} ` : "") +
      `[pages:${indexation.pages.length}]`,
  }));

  const csvError = computed(() => {
    if (!indexation.acceptedIssueSuggestion) {
      return t(
        'Vous devez spécifier une publication et un numéro pour continuer (cliquez sur la liste déroulante qui indique actuellement "Numéro inconnu")',
      );
    }
    if (!indexation.releaseDate) {
      return t(
        'Vous devez spécifier la date de sortie du numéro dans "Méta-données" pour continuer',
      );
    }
    if (!Object.keys(storiesWithDetails).length) {
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
  });

  const csvEntries = computed(() => {
    if (csvError.value) {
      return undefined;
    }
    const data = indexation.entries.map((entry, idx) => {
      const storyWithDetails =
        storiesWithDetails[entry.acceptedStory?.storycode || ""];
      const { storyKindRows } = entry.acceptedStoryKind!;

      const includedInIdx = entry.includedInEntryId
        ? indexation.entries.findIndex((e) => e.id === entry.includedInEntryId)
        : undefined;
      const includedIn =
        includedInIdx !== undefined
          ? entrycodesWithPageNumbers.value[includedInIdx]
          : undefined;

      return {
        entrycode: entrycodesWithPageNumbers.value[idx],
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
        ...(entry.includedInEntry ? { includedIn } : {}),
      };
    });

    return [Object.keys(data[0]), ...data.map((row) => Object.values(row))]
      .map((row) => row.join(";"))
      .join("\n");
  });

  return {
    csvError,
    csvEntries,
    csvMetadata,
  };
};
