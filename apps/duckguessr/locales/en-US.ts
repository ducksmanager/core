export default async () =>
  Promise.resolve(
    Object.keys(await import("./fr-FR.json")).reduce(
      (acc, value) => ({ ...acc, [value]: value }),
      {} as Record<string, string>,
    ),
  );
