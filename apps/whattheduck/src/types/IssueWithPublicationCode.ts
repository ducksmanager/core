import { Issue } from "@/types/Issue";

export interface IssueWithPublicationCode extends Issue {
  publicationCode: string;
}
