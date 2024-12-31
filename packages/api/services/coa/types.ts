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

export default { namespaceEndpoint: "/coa" }
;export type Events =  {

  getAuthorList: (
    personcodes: string[]) => { [_personcode: string]: string }
  searchAuthor: (
    partialAuthorName: string) => Record<string, string>

  getCountryList: (
    locale: string,
    countryCodes: string[]) => Record<string, string>

  getIssueDetails: (
    issuecode: string) => { releaseDate?: string; entries: SimpleEntry[] }
  getIssueCoverDetailsByPublicationcode: (
    publicationcode: string) => { covers: Record<string, IssueCoverDetails> }
  getIssueCoverDetails: (
    issuecodes: string[]) => Errorable<
        { covers: Record<string, IssueCoverDetails> },
        "Too many requests"
      >,
    
  getIssuePopularities: (
    issuecodes: string[]) => Record<
        string,
        {
          popularity: number;
        }
      >,
    
  getIssues: (
    issuecodes: string[],
    withTitles: boolean) => Record<string, SimpleInducksIssue>

  getIssuesByPublicationcodes: (
    publicationcodes: string[]) => Record<string, SimpleInducksIssue[]>

  getIssuesByStorycode: (
    storycode: string) => IssueWithIssuecodeOnly[]
  getRecentIssues: (
    ) => SimpleInducksIssue[]

  getFullPublicationList: (
    ) => Record<string, string>

  getPublicationListFromCountrycodes: (
    countrycodes: string[]) => Record<string, string>
  getPublicationListFromPublicationcodeList: (
    publicationCodes: string[]) => Record<string, string>

  getQuotationsByIssuecodes: (
    issueCodes: string[]) => Errorable<
        {
          quotations: Record<
            string,
            inducks_issuequotation & { estimationAverage: number }
          >;
        },
        "Bad request" | "Too many requests"
      >,
    

  searchStory: <WithIssues extends boolean>(
    keywords: string[],
    withIssues: WithIssues) => StorySearchResults<WithIssues>

  getStoryDetails: (
    storycodes: string[]) => Errorable<{ stories: Record<string, inducks_story> }, "Error">,
    
  getStoryversionsDetails: (
    storyversioncodes: string[]) => Errorable<
        { storyversions: Record<string, inducks_storyversion> },
        "Error"
      >,
    
  getStoryjobs: (
    storyversioncode: string) => Errorable<{ data: inducks_storyjob[] }, "Error">
}
