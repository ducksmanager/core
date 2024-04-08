export interface SimpleIssueWithPublication {
  countrycode: string;
  publicationcode: string;
  title: string;
  issuenumber: string;
  issuecode: string;
  coverId: number | null;
  fullUrl: string | null;
  popularity: number | null;
}
