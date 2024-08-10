import type { inducks_issue } from "~prisma-schemas/schemas/coa";

export type SimpleInducksIssue = Pick<
  inducks_issue,
  "publicationcode" | "issuenumber" | "issuecode"
>

export type AugmentedIssue<T extends (keyof inducks_issue)[] | object = []> = SimpleInducksIssue &
  (T extends (keyof inducks_issue)[] ? Pick<inducks_issue, T[number]> : T);
