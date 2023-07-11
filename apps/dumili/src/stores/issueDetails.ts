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

type Issue = Pick<
  inducks_issue,
  | "publicationcode"
  | "issuenumber"
  | "issuecode"
  | "oldestdate"
  | "price"
  | "pages"
>;

export const issueDetails = defineStore("issueDetails", () => ({
  issue: ref({} as Issue),
  entries: ref([] as Entry[]),
}));
