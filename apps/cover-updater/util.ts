export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

export const mapWithConcurrency = async <T, U>(
  items: T[],
  concurrency: number,
  map: (item: T) => Promise<U>,
) => {
  const results = new Array<U>(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await map(items[index]!);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker),
  );
  return results;
};
