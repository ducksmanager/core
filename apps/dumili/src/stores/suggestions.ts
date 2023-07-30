import {
  inducks_entry,
  inducks_storyversion,
} from "ducksmanager/api/dist/prisma/client_coa";
import { inducks_storyjob } from "ducksmanager/api/dist/prisma/client_coa";
import { inducks_issue } from "ducksmanager/api/dist/prisma/client_coa";
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
>;

type Storyjob = Pick<inducks_storyjob, "personcode" | "plotwritartink">;

export abstract class Suggestion {
  public type: "ai" | "user" = "user";
  public isAccepted: boolean = false;
  abstract getId(): string | undefined;

  constructor(meta: { type: "ai" | "user"; isAccepted: boolean }) {
    this.type = meta.type;
    this.isAccepted = meta.isAccepted;
  }
}

export class EntrySuggestion extends Suggestion {
  getId() {
    return this.data.entrycode || undefined;
  }

  constructor(
    public data: Partial<
      Pick<
        inducks_entry,
        | "entrycode"
        | "entrycomment"
        | "printedhero"
        | "title"
        | "part"
        | "position"
      >
    > & {
      storyversion?: Storyversion;
      storyjobs?: Storyjob[];
    },
    meta: { type: "ai" | "user"; isAccepted: boolean }
  ) {
    super(meta);
  }
}

export class StoryversionKindSuggestion extends Suggestion {
  getId() {
    return this.kind || undefined;
  }

  constructor(
    meta: { type: "ai" | "user"; isAccepted: boolean },
    public kind: StoryversionKind
  ) {
    super(meta);
  }
}

export class IssueSuggestion extends Suggestion {
  getId() {
    return this.data.issuecode || undefined;
  }

  constructor(
    public data: Pick<
      inducks_issue,
      "publicationcode" | "issuenumber" | "issuecode"
    > &
      Partial<Pick<inducks_issue, "oldestdate" | "price" | "pages">>,
    meta: { type: "ai" | "user"; isAccepted: boolean },
    public coverId: number | null
  ) {
    super(meta);
  }
}

export const suggestions = defineStore("suggestions", () => {
  const entrySuggestions = ref({} as Record<string, EntrySuggestion[]>),
    storyversionKindSuggestions = ref(
      {} as Record<string, StoryversionKindSuggestion[]>
    ),
    issueSuggestions = ref([] as IssueSuggestion[]),
    pendingIssueSuggestions = computed(() =>
      issueSuggestions.value.filter(
        ({ isAccepted }) => isAccepted === undefined
      )
    );

  const acceptSuggestion = <T extends Suggestion>(
    suggestions: T[],
    conditionFn: (suggestion: T) => boolean
  ) => {
    suggestions.forEach(
      (suggestion) => (suggestion.isAccepted = conditionFn(suggestion))
    );
  };

  const getAcceptedSuggestion = <T extends Suggestion>(suggestions: T[]) =>
    suggestions.find(({ isAccepted }) => isAccepted);

  const rejectAllSuggestions = <T extends Suggestion>(suggestions: T[]) =>
    suggestions.forEach((suggestion) => (suggestion.isAccepted = false));

  return {
    entrySuggestions,
    storyversionKindSuggestions,
    issueSuggestions,
    getAcceptedSuggestion,
    acceptSuggestion,
    rejectAllSuggestions,
    hasPendingIssueSuggestions: computed(
      () => pendingIssueSuggestions.value.length > 0
    ),
    acceptedIssue: computed(() =>
      getAcceptedSuggestion(issueSuggestions.value)
    ),
    acceptedEntries: computed(() =>
      Object.entries(entrySuggestions.value).reduce<
        Record<string, EntrySuggestion | undefined>
      >(
        (acc, [entrycode, suggestions]) => ({
          ...acc,
          [entrycode]: getAcceptedSuggestion(suggestions),
        }),
        {}
      )
    ),
    acceptedStoryversionKinds: computed(() =>
      Object.entries(storyversionKindSuggestions.value).reduce<
        Record<string, StoryversionKindSuggestion | undefined>
      >(
        (acc, [entrycode, suggestions]) => ({
          ...acc,
          [entrycode]: getAcceptedSuggestion(suggestions),
        }),
        {}
      )
    ),
  };
});
