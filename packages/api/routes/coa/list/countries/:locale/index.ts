import { prismaCoa } from "prisma-clients";
import { Prisma } from "prisma-clients/client_coa";

import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: { [_countrycode: string]: string };
    params: { locale: string };
    query: { countryCodes: string | null };
  }>
) =>
  res.json(
    await getCountryNames(
      req.params.locale,
      req.query.countryCodes ? req.query.countryCodes.split(",") : null
    )
  );

const getCountryNames = async (
  locale: string,
  countryIds: string[] | null = null
): Promise<{ [countrycode: string]: string }> =>
  (
    await prismaCoa.$queryRawUnsafe<
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
            countryIds?.length
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
