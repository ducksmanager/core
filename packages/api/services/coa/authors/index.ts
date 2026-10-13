import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

export default {
  getAuthorList: ev(v.array(v.string()))(async (personcodes) =>
    getAuthorFullNames([...new Set(personcodes)]),
  ),

  searchAuthor: ev(v.string())(async (partialAuthorName) =>
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
