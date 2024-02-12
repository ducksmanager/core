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
