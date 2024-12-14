import type { SimpleInducksIssue } from "~dm-types/AugmentedIssue";
import type { IssueCoverDetails } from "~dm-types/IssueCoverDetails";
import type { IssueWithIssuecodeOnly } from "~dm-types/IssueWithIssuecodeOnly";
import type { SimpleEntry } from "~dm-types/SimpleEntry";
import type { StorySearchResults } from "~dm-types/StorySearchResults";
import type {
  inducks_issuequotation,
  inducks_story,
  inducks_storyjob,
  inducks_storyversion,
} from "~prisma-schemas/schemas/coa";
import type { Errorable } from "~socket.io-services";

export const namespaceEndpoint = "/coa";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;
  abstract getAuthorList: (
    personcodes: string[],
    callback: (value: { [_personcode: string]: string }) => void,
  ) => void;
  abstract searchAuthor: (
    partialAuthorName: string,
    callback: (value: Record<string, string>) => void,
  ) => void;

  abstract getCountryList: (
    locale: string,
    countryCodes: string[],
    callback: (value: Record<string, string>) => void,
  ) => void;

  abstract getIssueDetails: (
    issuecode: string,
    callback: (value: { releaseDate?: string; entries: SimpleEntry[] }) => void,
  ) => void;
  abstract getIssueCoverDetailsByPublicationcode: (
    publicationcode: string,
    callback: (value: { covers: Record<string, IssueCoverDetails> }) => void,
  ) => void;
  abstract getIssueCoverDetails: (
    issuecodes: string[],
    callback: (
      value: Errorable<
        { covers: Record<string, IssueCoverDetails> },
        "Too many requests"
      >,
    ) => void,
  ) => void;
  abstract getIssuePopularities: (
    issuecodes: string[],
    callback: (
      value: Record<
        string,
        {
          popularity: number;
        }
      >,
    ) => void,
  ) => void;
  abstract getIssues: (
    issuecodes: string[],
    withTitles: boolean,
    callback: (value: Record<string, SimpleInducksIssue>) => void,
  ) => void;

  abstract getIssuesByPublicationcodes: (
    publicationcodes: string[],
    callback: (value: Record<string, SimpleInducksIssue[]>) => void,
  ) => void;

  abstract getIssuesByStorycode: (
    storycode: string,
    callback: (value: IssueWithIssuecodeOnly[]) => void,
  ) => void;
  abstract getRecentIssues: (
    callback: (value: SimpleInducksIssue[]) => void,
  ) => void;

  abstract getFullPublicationList: (
    callback: (value: Record<string, string>) => void,
  ) => void;

  abstract getPublicationListFromCountrycodes: (
    countrycodes: string[],
    callback: (value: Record<string, string>) => void,
  ) => void;
  abstract getPublicationListFromPublicationcodeList: (
    publicationCodes: string[],
    callback: (value: Record<string, string>) => void,
  ) => void;

  abstract getQuotationsByIssuecodes: (
    issueCodes: string[],
    callback: (
      value: Errorable<
        {
          quotations: Record<
            string,
            inducks_issuequotation & { estimationAverage: number }
          >;
        },
        "Bad request" | "Too many requests"
      >,
    ) => void,
  ) => void;

  abstract searchStory: <WithIssues extends boolean>(
    keywords: string[],
    withIssues: WithIssues,
    callback: (value: StorySearchResults<WithIssues>) => void,
  ) => void;

  abstract getStoryDetails: (
    storycodes: string[],
    callback: (
      value: Errorable<{ stories: Record<string, inducks_story> }, "Error">,
    ) => void,
  ) => void;
  abstract getStoryversionsDetails: (
    storyversioncodes: string[],
    callback: (
      value: Errorable<
        { storyversions: Record<string, inducks_storyversion> },
        "Error"
      >,
    ) => void,
  ) => void;
  abstract getStoryjobs: (
    storyversioncode: string,
    callback: (value: Errorable<{ data: inducks_storyjob[] }, "Error">) => void,
  ) => void;
}
