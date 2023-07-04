import {
  inducks_entry,
  inducks_issue,
} from "ducksmanager/api/dist/prisma/client_coa";
import { defineStore } from "pinia";

type Entry = Pick<
  inducks_entry,
  "entrycode" | "storyversioncode" | "entrycomment" | "printedhero"
> & {
  pages: number | "0q" | "0+";
  plot: string;
  writer: string;
  artist: string;
  ink: string;
  extra: string;
};

type Issue = Pick<
  inducks_issue,
  "issuecode" | "oldestdate" | "price" | "pages"
>;

export const issueDetails = defineStore("issue", () => ({
  issue: ref(null as Issue | null),
  entries: ref([] as Entry[]),
}));
