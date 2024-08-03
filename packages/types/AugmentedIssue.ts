import type { inducks_issue } from "~prisma-schemas/schemas/coa";

export type AugmentedIssue<T extends (keyof inducks_issue)[] | object = []> = Pick<
  inducks_issue,
  "publicationcode" | "issuenumber" | "issuecode"
> &
  (T extends (keyof inducks_issue)[] ? Pick<inducks_issue, T[number]> : T);
