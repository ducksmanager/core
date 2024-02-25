import { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import { SimpleEntry } from "~dm-types/SimpleEntry";
import { SimpleIssue } from "~dm-types/SimpleIssue";
import { SimpleIssueWithPublication } from "~dm-types/SimpleIssueWithPublication";
import { StorySearchResults } from "~dm-types/StorySearchResults";
import {
  inducks_issue,
  inducks_issuequotation,
inducks_story,
inducks_storyjob,
inducks_storyversion,
} from "~prisma-clients/client_coa";
import { Errorable } from "~socket.io-services/types";

export default abstract class {
  static namespaceEndpoint: string = "/coa";
  abstract getAuthorList: (
    personcodes: string[],
    callback: (value: { [_personcode: string]: string }) => void,
  ) => void;
  abstract searchAuthor: (
    partialAuthorName: string,
    callback: (value: Record<string, inducks_issue>) => void,
  ) => void;

  abstract getCountryList: (
    locale: string,
    countryCodes: string[],
    callback: (value: Record<string, string>) => void,
  ) => void;

  abstract getIssuesWithTitles: (
    publicationcode: string,
    callback: (
      value: {
        issuenumber: string;
        title: string | null;
      }[],
    ) => void,
  ) => void;
  abstract getIssueDetails: (
    publicationcode: string,
    issuenumber: string,
    callback: (value: { releaseDate: string; entries: SimpleEntry[] }) => void,
  ) => void;
  abstract getIssueCoverDetails: (
    publicationCodes: string[],
    callback: (
      value: Errorable<
        { covers: Record<string, IssueCoverDetails> },
        "Too many requests"
      >,
    ) => void,
  ) => void;
  abstract getIssuesByCode: (
    issueCodes: string[],
    callback: (value: Record<string, SimpleIssueWithPublication>) => void,
  ) => void;

  abstract decompose: (
    issueCodes: string[],
    callback: (value: Record<string, inducks_issue>) => void,
  ) => void;
  abstract getIssuesByStorycode: (
    storycode: string,
    callback: (value: SimpleIssue[]) => void,
  ) => void;
  abstract getCountByPublicationcode: (
    callback: (value: Record<string, number>) => void,
  ) => void;
  abstract getRecentIssues: (
    callback: (value: inducks_issue[]) => void,
  ) => void;
  abstract getIssuesByPublicationCodes: (
    publicationCodes: string[],
    callback: (
      value: Errorable<{ issues: SimpleIssue[] }, "Too many requests">,
    ) => void,
  ) => void;

  abstract getPublicationListFromCountrycode: (
    countrycode: string,
    callback: (value: Record<string, string>) => void,
  ) => void;
  abstract getPublicationListFromPublicationcodeList: (
    publicationCodes: string[],
    callback: (value: Record<string, string>) => void,
  ) => void;

  abstract getQuotationsByIssueCodes: (
    issueCodes: string[],
    callback: (
      value: Errorable<
        { quotations: inducks_issuequotation[] },
        "Bad request" | "Too many requests"
      >,
    ) => void,
  ) => void;
  abstract getQuotationsByPublicationCodes: (
    publicationCodes: string[],
    callback: (
      value: Errorable<{ quotations: inducks_issuequotation[] }, "Bad request">,
    ) => void,
  ) => void;

  abstract searchStory: (
    keywords: string[],
    withIssues: boolean,
    callback: (value: StorySearchResults) => void,
  ) => void;

  abstract getStoryDetails: (storycode: string, callback: (value: Errorable<{data: inducks_story}, 'Error'>) => void) => void;
  abstract getStoryversionDetails: (storyversioncode: string, callback: (value: Errorable<{data: inducks_storyversion}, 'Error'>) => void) => void;
  abstract getStoryjobs: (storyversioncode: string, callback: (value: Errorable<{data: inducks_storyjob[]}, 'Error'>) => void) => void;
}
