import { Prisma, PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<
  Prisma.PromiseReturnType<typeof getCountryNames>,
  { locale: string },
  undefined,
  { countryIds: string }
>;
export const get = async (...[req, res]: ExpressCall<getCall>) =>
  res.json(
    await getCountryNames(req.params.locale, req.query.countryIds.split(","))
  );

export const getCountryNames = async (
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
