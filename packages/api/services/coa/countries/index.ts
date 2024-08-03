import type { Socket } from "socket.io";

import { Prisma } from "~prisma-clients/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-clients/schemas/coa/client";

import type Events from "../types";

export default (socket: Socket<Events>) => {
  socket.on("getCountryList", (locale, countryCodes, callback) =>
    getCountryNames(locale, countryCodes).then(callback),
  );
};

const getCountryNames = async (
  locale: string,
  countryIds?: string[],
): Promise<Record<string, string>> =>
  prismaCoa
    .$queryRawUnsafe<
      {
        countrycode: string;
        countryname: string;
        default_countryname: string;
      }[]
    >(
      `
      SELECT inducks_country.countrycode,
             inducks_countryname.countryname,
             inducks_country.countryname AS default_countryname
      FROM inducks_country
               LEFT JOIN inducks_countryname on inducks_country.countrycode = inducks_countryname.countrycode
      WHERE languagecode = '${locale}'
        AND ${
          countryIds?.length
            ? `inducks_country.countrycode IN (${Prisma.join(countryIds)})`
            : `inducks_country.countrycode != 'zz'`
        }`,
    )
    .then((results) =>
      results.reduce(
        (acc, value) => ({
          ...acc,
          [value.countrycode]: value.countryname || value.default_countryname,
        }),
        {},
      ),
    );
