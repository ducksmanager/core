import { Handler } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const { locale } = req.params;
  const { countryIds } = req.query as { [key: string]: string };

  return res.json(await getCountryNames(locale, countryIds.split(",")));
};

export const getCountryNames = async (
  locale: string,
  countryIds: string[] | null = null
) =>
  (
    await prisma.$queryRawUnsafe<
      {
        countrycode: string;
        countryname: string;
        default_countryname: string;
      }[]
    >(`
        SELECT inducks_country.countrycode,
               inducks_countryname.countryname,
               inducks_country.countryname AS default_countryname
        FROM inducks_country
                 LEFT JOIN inducks_countryname on inducks_country.countrycode = inducks_countryname.countrycode
        WHERE languagecode = '${locale}'
          AND ${
            countryIds
              ? `inducks_country.countrycode IN (${Prisma.join(countryIds)})`
              : `inducks_country.countrycode != 'zz'`
          }`)
  ).reduce(
    (acc, value) => ({
      ...acc,
      [value.countrycode]: value.countryname || value.default_countryname,
    }),
    {}
  );
