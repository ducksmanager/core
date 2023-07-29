import { inducks_storyversion } from "ducksmanager/api/dist/prisma/client_coa";
import { inducks_storyjob } from "ducksmanager/api/dist/prisma/client_coa";
import {
  inducks_entry,
  inducks_issue,
} from "ducksmanager/api/dist/prisma/client_coa";
import { defineStore } from "pinia";

export enum StoryversionKind {
  "Story" = "n",
  "Newspaper strip" = "k",
  "Story or newspaper strip" = "nk",
  "Cover or illustration" = "ci",
  "Cover" = "c",
  "Illustration" = "i",
  "Game or puzzle" = "g",
  "Text story" = "t",
  "Article" = "a",
  "Painting" = "PL",
  "Painting (portrait)" = "P",
  "Painting (landscape)" = "L",
  "Centerfold" = "f",
}

type Storyversion = Partial<
  Pick<
    inducks_storyversion,
    "entirepages" | "rowsperpage" | "storyversioncode" | "storycode" | "what"
  >
> & { kind?: `${StoryversionKind}` };

type Storyjob = Pick<inducks_storyjob, "personcode" | "plotwritartink">;

type Suggestion = {
  isAccepted?: boolean;
  type: "ongoing" | "ai" | "custom";
};

export type SuggestedEntry = Partial<
  Pick<
    inducks_entry,
    "entrycode" | "entrycomment" | "printedhero" | "title" | "part" | "position"
  >
> & {
  storyversion?: Storyversion;
  storyjobs?: Storyjob[];
} & Suggestion;

export type SuggestedIssue = Pick<
  inducks_issue,
  "publicationcode" | "issuenumber" | "issuecode"
> &
  Suggestion & {
    coverId: number | null;
  } & Partial<Pick<inducks_issue, "oldestdate" | "price" | "pages">>;

type UnknownIssue = Partial<NonNullable<SuggestedIssue>> & {
  isAccepted: boolean;
};

export const issueDetails = defineStore("issueDetails", () => {
  const entrySuggestions = ref({} as Record<string, SuggestedEntry[]>),
    issueSuggestions = ref([] as SuggestedIssue[]),
    pendingIssueSuggestions = computed(() =>
      issueSuggestions.value.filter(
        ({ isAccepted }) => isAccepted === undefined
      )
    ),
    issueOptions = computed((): (UnknownIssue | SuggestedIssue)[] => [
      ...issueSuggestions.value,
      { isAccepted: true },
    ]);

  return {
    issueSuggestions,
    issueOptions,
    issue: computed(
      () => issueOptions.value.find(({ isAccepted }) => isAccepted)!
    ),
    hasPendingIssueSuggestions: computed(
      () => pendingIssueSuggestions.value.length > 0
    ),
    acceptedEntries: computed(() =>
      Object.entries(entrySuggestions.value).reduce(
        (acc, [entrycode, suggestions]) => ({
          ...acc,
          [entrycode]: suggestions.find(({ isAccepted }) => isAccepted)!,
        }),
        {} as Record<string, SuggestedEntry>
      )
    ),
    rejectAllIssueSuggestions: () => {
      issueSuggestions.value.forEach(
        (suggestion) => (suggestion.isAccepted = false)
      );
    },
    acceptIssueSuggestion: (acceptedSuggestionIssuecode?: string) => {
      issueSuggestions.value.forEach(
        (suggestion) =>
          (suggestion.isAccepted =
            acceptedSuggestionIssuecode === suggestion.issuecode)
      );
    },
    rejectAllEntrySuggestions: (entryurl: string) => {
      entrySuggestions.value[entryurl].forEach(
        (suggestion) => (suggestion.isAccepted = false)
      );
    },
    acceptEntrySuggestion: (
      entryurl: string,
      acceptedSuggestionStorycode?: string
    ) => {
      debugger;
      entrySuggestions.value[entryurl].forEach(
        (suggestion) =>
          (suggestion.isAccepted =
            acceptedSuggestionStorycode === suggestion.storyversion?.storycode)
      );
    },
    entrySuggestions,
  };
});
