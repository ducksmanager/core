/** The year printed on the magazine, or null where none usable is set. */
export const releaseYear = ({
  releaseDate,
}: {
  releaseDate: string | null;
}) => {
  const year = Number((releaseDate ?? "").slice(0, 4));
  // Inducks' own decade scale starts in the 1930s; anything below is a typo
  // rather than a date, and Quackinator would decline it anyway.
  return year >= 1930 && year <= 2100 ? year : null;
};
