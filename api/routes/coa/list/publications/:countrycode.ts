import bodyParser from "body-parser";
import { Handler, Response } from "express";

import { Prisma } from "~/dist/prisma/client_coa";

import { getPublicationTitles } from "./index";

const parseForm = bodyParser.json();

export type getType = Prisma.PromiseReturnType<
  typeof getPublicationTitlesFromCountry
>;
export const get = [
  parseForm,
  (async (req, res: Response<getType>) =>
    res.json(
      await getPublicationTitlesFromCountry(req.params.countrycode)
    )) as Handler,
];

const getPublicationTitlesFromCountry = async (countrycode: string) =>
  await getPublicationTitles({ startsWith: `${countrycode}/` });
