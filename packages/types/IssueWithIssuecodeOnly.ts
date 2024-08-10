import type { inducks_issue } from "~prisma-schemas/schemas/coa";

type AllNonNullable<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};

export type IssueWithIssuecodeOnly = AllNonNullable<
    Pick<inducks_issue, "issuecode">
>;
