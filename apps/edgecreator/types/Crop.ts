export interface Crop {
  width: number;
  height: number;
  editMode: "single" | "range";
  countrycode: string;
  publicationcode: string;
  issuenumber: string;
  issuenumberEnd: string;
}
