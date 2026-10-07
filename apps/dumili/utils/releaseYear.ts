export const releaseYear = ({
  releaseDate,
}: {
  releaseDate: string | null;
}) => {
  const year = Number((releaseDate ?? "").slice(0, 4));
  // Inducks' decade scale starts at the 1930s; earlier is a typo.
  return year >= 1930 && year <= 2100 ? year : null;
};
