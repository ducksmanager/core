import bodyParser from "body-parser";
import { Handler } from "express";

import { getPublicationTitles } from "~/routes/coa/list/publications/index";

const parseForm = bodyParser.json();

export const get = [
  parseForm,
  (async (req, res) => {
    const { countrycode } = req.params;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(await getPublicationTitlesFromCountry(countrycode)));
  }) as Handler,
];

const getPublicationTitlesFromCountry = async (countrycode: string) =>
  await getPublicationTitles({ startsWith: `${countrycode}/` });
