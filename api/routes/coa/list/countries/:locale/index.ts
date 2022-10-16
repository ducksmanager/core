import { Handler } from "express";

import { getCountryNames } from "~/routes/coa/list/countries/:locale/:countryCodes";

export const get: Handler = async (req, res) => {
  const { locale } = req.params;

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(await getCountryNames(locale)));
};
