export const availableLocales: {
  key: string;
  shortKey: string;
  name: string;
  flagName: string;
}[] = [
  {
    key: "en-US",
    shortKey: "en",
    name: "English",
    flagName: "uk",
  },
  {
    key: "fr",
    shortKey: "fr",
    name: "Français",
    flagName: "fr",
  },
];

export const getCurrentLocaleShortKey = (locale: string): string => {
  return availableLocales.find(({ key }) => key === locale)?.shortKey || "en";
};
