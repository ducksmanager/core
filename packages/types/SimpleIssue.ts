import type { IssueWithIssuecodeOnly } from "AllNonNullable";

import type { EntryPartInfo } from "./EntryPartInfo";

export type SimpleIssueWithPartInfo = IssueWithIssuecodeOnly & EntryPartInfo;
