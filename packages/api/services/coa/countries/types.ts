export default interface Countries {
  getCountryList: (
    locale: string,
    countryCodes: string[],
    callback: (value: Record<string, string>) => void,
  ) => void;
}
