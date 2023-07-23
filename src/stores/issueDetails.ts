import { inducks_storyversion } from "ducksmanager/api/dist/prisma/client_coa";
import { inducks_story } from "ducksmanager/api/dist/prisma/client_coa";
import { inducks_entryurl } from "ducksmanager/api/dist/prisma/client_coa";
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

type Story = Pick<inducks_story, "title" | "storycode">;

type Storyversion = Partial<
  Pick<
    inducks_storyversion,
    "entirepages" | "rowsperpage" | "storyversioncode" | "storycode" | "what"
  >
> & { story?: Story; kind?: `${StoryversionKind}` };

type Storyjob = Pick<inducks_storyjob, "personcode" | "plotwritartink">;

type Entryurl = {
  url: NonNullable<inducks_entryurl["url"]>;
};

export type Entry = Partial<
  Pick<
    inducks_entry,
    "entrycode" | "entrycomment" | "printedhero" | "title" | "part" | "position"
  >
> & {
  storyversion?: Storyversion;
  storyjobs?: Storyjob[];
  url: Entryurl;
};

export type SuggestedIssue = Pick<
  inducks_issue,
  "publicationcode" | "issuenumber" | "issuecode"
> & {
  accepted?: boolean;
  isCustom?: boolean;
  isAi: boolean;
  coverId: number | null;
} & Partial<Pick<inducks_issue, "oldestdate" | "price" | "pages">>;

type UnknownIssue = Partial<NonNullable<SuggestedIssue>> & {
  accepted: boolean;
};

export const issueDetails = defineStore("issueDetails", () => {
  const entries = ref([] as Entry[]),
    issueSuggestions = ref([] as SuggestedIssue[]),
    pendingIssueSuggestions = computed(() =>
      issueSuggestions.value.filter(({ accepted }) => accepted === undefined)
    ),
    issueOptions = computed((): (UnknownIssue | SuggestedIssue)[] => [
      ...issueSuggestions.value,
      { accepted: true },
    ]);

  return {
    issueSuggestions,
    issueOptions,
    issue: computed(() => issueOptions.value.find(({ accepted }) => accepted)!),
    hasPendingIssueSuggestions: computed(
      () => pendingIssueSuggestions.value.length > 0
    ),
    rejectAllIssueSuggestions: () => {
      issueSuggestions.value.forEach(
        (suggestion) => (suggestion.accepted = false)
      );
    },
    acceptIssueSuggestion: (acceptedSuggestionIssuecode?: string) => {
      issueSuggestions.value.forEach(
        (suggestion) =>
          (suggestion.accepted =
            acceptedSuggestionIssuecode === suggestion.issuecode)
      );
    },
    entries,
  };
});
