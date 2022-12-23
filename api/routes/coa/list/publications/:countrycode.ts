import bodyParser from "body-parser";
import { Handler } from "express";

import { getPublicationTitles } from "~/routes/coa/list/publications/index";

const parseForm = bodyParser.json();

export const get = [
  parseForm,
  (async (req, res) =>
    res.json(
      await getPublicationTitlesFromCountry(req.params.countrycode)
    )) as Handler,
];

const getPublicationTitlesFromCountry = async (countrycode: string) =>
  await getPublicationTitles({ startsWith: `${countrycode}/` });
