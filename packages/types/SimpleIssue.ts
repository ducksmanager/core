import {
  inducks_entry,
  inducks_issue,
  inducks_storyversion,
} from "~prisma-clients/client_coa";

type AllNonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type SimpleIssue = AllNonNullable<
  Pick<inducks_issue, "shortIssuecode" | "publicationcode" | "shortIssuenumber">
>;

export type PartInfo = AllNonNullable<
  Pick<inducks_entry, "storyversioncode" | "part"> &
    Pick<inducks_storyversion, "estimatedpanels"> & {
      total_estimatedpanels: inducks_storyversion["estimatedpanels"];
    }
>;

export type SimpleIssueWithPartInfo = SimpleIssue & PartInfo;
