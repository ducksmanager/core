import { Busboy } from "busboy";
import { Request, Response } from "express";

export type ExpressCall<
  T extends {
    resBody?: object;
    params?: object;
    reqBody?: object;
    query?: object;
  }
> = [
  Request<T["params"], T["resBody"], T["reqBody"], T["query"]> & {
    busboy: Busboy;
  },

  Response<T["resBody"]>
];
