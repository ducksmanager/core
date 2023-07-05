import { inducks_storyversion } from "ducksmanager/api/dist/prisma/client_coa";
import { inducks_story } from "ducksmanager/api/dist/prisma/client_coa";
import { inducks_entryurl } from "ducksmanager/api/dist/prisma/client_coa";
import { inducks_storyjob } from "ducksmanager/api/dist/prisma/client_coa";
import {
  inducks_entry,
  inducks_issue,
} from "ducksmanager/api/dist/prisma/client_coa";
import { defineStore } from "pinia";

type Story = Pick<inducks_story, "title" | "storycode">;

type Storyversion = Pick<
  inducks_storyversion,
  "entirepages" | "kind" | "rowsperpage" | "storyversioncode" | "what"
> & { story: Story };

type Storyjob = Pick<inducks_storyjob, "personcode" | "plotwritartink">;

type Entryurl = {
  url: NonNullable<inducks_entryurl["url"]>;
};

type Entry = Partial<
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
  "issuecode" | "oldestdate" | "price" | "pages"
>;

export const issueDetails = defineStore("issue", () => ({
  issue: ref(null as Issue | null),
  entries: ref([] as Entry[]),
}));
