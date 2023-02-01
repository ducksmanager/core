import { Prisma } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

import { getCountryNames } from "./:countryCodes";

export type getCall = Call<
  Prisma.PromiseReturnType<typeof getCountryNames>,
  { locale: string }
>;
export const get = async (...[req, res]: ExpressCall<getCall>) =>
  res.json(await getCountryNames(req.params.locale));
