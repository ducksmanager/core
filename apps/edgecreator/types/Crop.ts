export interface Crop {
  width: number;
  height: number;
  editMode: "single" | "range";
  countryCode: string;
  publicationCode: string;
  issueNumber: string;
  issueNumberEnd: string;
}
