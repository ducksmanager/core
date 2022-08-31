import { Handler } from "express";

import { Prisma, PrismaClient } from "~prisma_clients/client_coa";

const prisma = new PrismaClient();

export const get: Handler = async (req, res) => {
  const locale = req.params.locale;
  const countryIds = req.params.countryIds
    ? req.params.countryIds.split(",")
    : null;

  const countrycodeCondition = countryIds
    ? `inducks_country.countrycode IN (${Prisma.join(countryIds)})`
    : `inducks_country.countrycode != 'zz'`;

  interface countryCodeWithNames {
    countrycode: string;
    countryname: string;
    default_countryname: string;
  }

  const results = await prisma.$queryRaw<countryCodeWithNames[]>`
      SELECT inducks_country.countrycode,
             inducks_countryname.countryname,
             inducks_country.countryname AS default_countryname
      FROM inducks_country
               LEFT JOIN inducks_countryname on inducks_country.countrycode = inducks_countryname.countrycode
      WHERE languagecode = ${locale}
        AND ${countrycodeCondition}`;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      results.reduce(
        (acc, value) => ({
          ...acc,
          [value.countrycode]: value.countryname || value.default_countryname,
        }),
        {}
      )
    )
  );
};
