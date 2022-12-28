import { Handler, Response } from "express";

import { Prisma } from "~prisma_clients/client_coa";

import { getCountryNames } from "./:countryCodes";

export type getType = Prisma.PromiseReturnType<typeof getCountryNames>;
export const get: Handler = async (req, res: Response<getType>) => {
  const { locale } = req.params;

  return res.json(await getCountryNames(locale));
};
