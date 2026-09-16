import { Prisma } from "~prisma-schemas/schemas/coa";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

export default {
  getCountryList: ev(
    v.string(),
    v.optional(v.array(v.string())),
  )(async (locale, countryCodes) => getCountryNames(locale, countryCodes)),
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
      Object.fromEntries(
        results.map((value) => [
          value.countrycode,
          value.countryname || value.default_countryname,
        ]),
      ),
    );
