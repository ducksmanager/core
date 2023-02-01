import bodyParser from "body-parser";

import { Prisma } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

import { getPublicationTitles } from "./index";

const parseForm = bodyParser.json();

export type getCall = Call<
  Prisma.PromiseReturnType<typeof getPublicationTitlesFromCountry>,
  { countrycode: string }
>;
export const get = [
  parseForm,
  async (...[req, res]: ExpressCall<getCall>) =>
    res.json(await getPublicationTitlesFromCountry(req.params.countrycode)),
];

const getPublicationTitlesFromCountry = async (countrycode: string) =>
  await getPublicationTitles({ startsWith: `${countrycode}/` });
