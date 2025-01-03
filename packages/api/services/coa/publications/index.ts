import type { Prisma as PrismaCoa } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

export default {
  getPublicationListFromCountrycodes: (countrycodes: string[]) =>
    getPublicationTitles({
      OR: countrycodes.map((countrycode) => ({
        publicationcode: { startsWith: `${countrycode}/` },
      })),
    }),

  getFullPublicationList: () => getPublicationTitles(),

  getPublicationListFromPublicationcodeList: (publicationCodes: string[]) =>
    getPublicationTitles(
      publicationCodes.length
        ? { publicationcode: { in: publicationCodes } }
        : {},
    ),
};

export const getPublicationTitles = async (
  filter?: PrismaCoa.inducks_publicationWhereInput,
): Promise<Record<string, string>> =>
  prismaCoa.inducks_publication
    .findMany({
      where: filter,
    })
    .then((results) =>
      results
        .map(({ publicationcode, title }) => ({
          publicationcode,
          title: title || publicationcode,
        }))
        .groupBy("publicationcode", "title"),
    );
