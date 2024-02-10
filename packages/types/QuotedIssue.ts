import { issue_condition } from "~prisma-clients/client_dm";

export type QuotedIssue = {
  publicationcode: string;
  issuenumber: string;
  condition: issue_condition;
  estimation: number;
  estimationGivenCondition: number;
};
