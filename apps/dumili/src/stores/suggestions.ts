import { Boundaries } from "~dumili-types/KumikoResult";
import {
  inducks_entry,
  inducks_issue,
  inducks_storyjob,
  inducks_storyversion,
} from "~prisma-clients/client_coa";

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

export type SuggestionMetaAi = {
  isAccepted: boolean;
  source: "ai";
  status: "success" | "failure";
};

type SuggestionMeta =
  | {
      source: "user" | "default";
      isAccepted: boolean;
    }
  | SuggestionMetaAi;

export abstract class Suggestion {
  abstract getId(): string | undefined;

  constructor(public meta: SuggestionMeta) {}
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
    meta: Suggestion["meta"]
  ) {
    super(meta);
  }
}

export class StoryversionKindSuggestion extends Suggestion {
  getId() {
    return this.data.kind || undefined;
  }

  constructor(
    public data: {
      kind: StoryversionKind;
      panels?: Boundaries[];
    },
    meta: Suggestion["meta"]
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
      Partial<Pick<inducks_issue, "oldestdate" | "price" | "pages">> & {
        coverId: number | null;
      },
    meta: Suggestion["meta"]
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
      issueSuggestions.value.filter(({ meta }) => meta.isAccepted === undefined)
    );

  const acceptSuggestion = <T extends Suggestion>(
    suggestions: T[],
    isAcceptedconditionFn: (suggestion: T) => boolean,
    otherMeta?: {
      source: SuggestionMetaAi["source"];
      status?: SuggestionMetaAi["status"];
    },
    addDataFn?: (suggestion: T) => void
  ) => {
    suggestions.forEach((suggestion) => {
      suggestion.meta.isAccepted = isAcceptedconditionFn(suggestion);
      if (isAcceptedconditionFn(suggestion) && otherMeta) {
        suggestion.meta.source = otherMeta.source;
        if (otherMeta.status) {
          (suggestion.meta as SuggestionMetaAi).status = otherMeta.status;
        }
        addDataFn && addDataFn(suggestion);
      }
    });
  };

  const getAcceptedSuggestion = <T extends Suggestion>(suggestions: T[]) =>
    suggestions.find(({ meta }) => meta.isAccepted);

  const rejectAllSuggestions = <T extends Suggestion>(suggestions: T[]) =>
    suggestions.forEach((suggestion) => (suggestion.meta.isAccepted = false));

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
