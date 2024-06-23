import type { issue_condition } from "~prisma-clients/extended/dm.extends";

export type QuotedIssue = {
  publicationcode: string;
  issuenumber: string;
  condition: issue_condition;
  estimation: number;
  estimationGivenCondition: number;
};
