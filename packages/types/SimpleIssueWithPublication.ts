import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa";

export interface SimpleIssueWithPublication {
  countrycode: string;
  publicationcode: string;
  title: string;
  issuenumber: string;
  issuecode: string;
  coverId: number | null;
  fullUrl: string | null;
  popularity: number | null;
  issueQuotation?: inducks_issuequotation;
}
