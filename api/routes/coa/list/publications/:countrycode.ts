import bodyParser from "body-parser";

import { ExpressCall } from "~routes/_express-call";
import { PublicationTitles } from "~types/PublicationTitles";

import { getPublicationTitles } from "./index";

const parseForm = bodyParser.json();

export const get = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: PublicationTitles;
      params: { countrycode: string };
    }>
  ) => res.json(await getPublicationTitlesFromCountry(req.params.countrycode)),
];

const getPublicationTitlesFromCountry = async (countrycode: string) =>
  await getPublicationTitles({ startsWith: `${countrycode}/` });
