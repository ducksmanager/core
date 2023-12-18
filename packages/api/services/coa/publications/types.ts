export default interface Publications {
  getPublicationListFromCountrycode: (
    countrycode: string,
    callback: (value: Record<string, string>) => void,
  ) => void;
  getPublicationListFromPublicationcodeList: (
    publicationCodes: string[],
    callback: (value: Record<string, string>) => void,
  ) => void;
}
