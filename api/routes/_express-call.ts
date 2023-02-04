import { Busboy } from "busboy";
import { Request, Response } from "express";

export type ExpressCall<
  resBody,
  params = undefined,
  reqBody = undefined,
  reqQuery = undefined
> = [
  Request<params, resBody, reqBody, reqQuery> & {
    busboy: Busboy;
  },

  Response<resBody>
];
