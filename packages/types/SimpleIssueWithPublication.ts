import { inducks_issuequotation } from "~prisma-clients/client_coa";

export interface SimpleIssueWithPublication {
  countrycode: string;
  publicationcode: string;
  title: string;
  shortIssuenumber: string;
  shortIssuecode: string;
  coverId: number | null;
  fullUrl: string | null;
  popularity: number | null;
  issueQuotation?: inducks_issuequotation;
}
