import { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import { SimpleEntry } from "~dm-types/SimpleEntry";
import { SimpleIssueWithPublication } from "~dm-types/SimpleIssueWithPublication";
import { Errorable } from "~services/types";

export default interface IssueDetails {
  getIssuesWithTitles: (
    publicationcode: string,
    callback: (
      value: {
        issuenumber: string;
        title: string | null;
      }[]
    ) => void
  ) => void;
  getIssueDetails: (
    publicationcode: string,
    issuenumber: string,
    callback: (value: { releaseDate: string; entries: SimpleEntry[] }) => void
  ) => void;
  getIssueCoverDetails: (
    publicationCodes: string[],
    callback: (
      value: Errorable<{covers: Record<string, IssueCoverDetails>}, "Too many requests">
    ) => void
  ) => void;
  getIssuesByCode: (
    issueCodes: string[],
    callback: (value: Record<string, SimpleIssueWithPublication>) => void
  ) => void;
}
