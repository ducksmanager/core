import { Busboy } from "busboy";
import { Request, Response } from "express";

import { Call } from "~types/Call";

export type ExpressCall<
  T extends Call<
    object | undefined,
    object | undefined,
    object | undefined,
    object | undefined
  >
> = [
  Request<T["params"], T["resBody"], T["reqBody"], T["reqQuery"]> & {
    busboy: Busboy;
  },

  Response<T["resBody"]>
];
