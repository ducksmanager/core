import { SimpleIssue } from "~dm-types/SimpleIssue";
import { inducks_issue } from "~prisma-clients/client_coa";

export default interface Issues {
  decompose: (
    issueCodes: string[],
    callback: (value: Record<string, inducks_issue>) => void,
  ) => void;
  getPublicationsByStorycode: (
    storycode: string,
    callback: (value: SimpleIssue[]) => void,
  ) => void;
  getCountByPublicationcode: (
    callback: (value: Record<string, number>) => void,
  ) => void;
  getRecentIssues: (callback: (value: inducks_issue[]) => void) => void;
  getIssuesByPublicationCodes: (
    publicationCodes: string[],
    callback: (value: SimpleIssue[]) => void,
  ) => void;
}
