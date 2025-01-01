import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

export default {
  getAuthorList: async (personcodes: string[]) =>
    getAuthorFullNames([...new Set(personcodes)]),

  searchAuthor: async (partialAuthorName: string) =>
    prismaCoa.inducks_person
      .findMany({
        where: {
          fullname: {
            startsWith: partialAuthorName,
          },
        },
        take: 10,
      })
      .then((authors) =>
        authors
          .map(({ personcode, fullname }) => ({
            personcode,
            fullname: fullname || personcode,
          }))
          .groupBy("personcode", "fullname"),
      ),
};

export const getAuthorFullNames = (authorPersoncodes: string[]) =>
  prismaCoa.inducks_person
    .findMany({
      where: {
        personcode: {
          in: authorPersoncodes,
        },
      },
    })
    .then((authors) =>
      authors
        .map(({ personcode, fullname }) => ({
          personcode,
          fullname: fullname || personcode,
        }))
        .groupBy("personcode", "fullname"),
    );
