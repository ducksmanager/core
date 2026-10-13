import type { Prisma as PrismaCoa } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

export default {
  getPublicationLanguagecode: ev(v.string())((publicationcode) =>
    prismaCoa.inducks_publication
      .findUnique({
        where: { publicationcode },
        select: { languagecode: true },
      })
      .then((publication) => publication?.languagecode ?? null),
  ),

  getPublicationListFromCountrycodes: ev(v.array(v.string()))((countrycodes) =>
    getPublicationTitles({
      OR: countrycodes.map((countrycode) => ({
        publicationcode: { startsWith: `${countrycode}/` },
      })),
    }),
  ),

  getFullPublicationList: () => getPublicationTitles(),

  getPublicationListFromPublicationcodeList: ev(v.array(v.string()))(
    (publicationcodes) =>
      getPublicationTitles(
        publicationcodes.length
          ? { publicationcode: { in: publicationcodes } }
          : {},
      ),
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
