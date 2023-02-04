import { Prisma, PrismaClient } from "~/dist/prisma/client_coa";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<
    { [_countrycode: string]: string },
    { locale: string },
    undefined,
    { countryCodes: string | null }
  >
) =>
  res.json(
    await getCountryNames(
      req.params.locale,
      req.query.countryCodes?.split(",") || null
    )
  );

const getCountryNames = async (
  locale: string,
  countryIds: string[] | null = null
): Promise<{ [countrycode: string]: string }> =>
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
    {} as { [countrycode: string]: string }
  );
