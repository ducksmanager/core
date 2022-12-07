import { Handler } from "express";

import { getCountryNames } from "~/routes/coa/list/countries/:locale/:countryCodes";

export const get: Handler = async (req, res) => {
  const { locale } = req.params;

  return res.json(await getCountryNames(locale));
};
