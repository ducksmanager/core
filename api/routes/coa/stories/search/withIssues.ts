import { PromiseReturnType } from "@prisma/client/scripts/default-index";
import bodyParser from "body-parser";

import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

import { getStoriesByKeywords } from "./index";

const parseForm = bodyParser.json();

export type postCall = Call<
  PromiseReturnType<typeof getStoriesByKeywords>,
  undefined,
  { keywords: string }
>;

export const post = [
  parseForm,
  async (...[req, res]: ExpressCall<postCall>) => {
    if (!req.body.keywords) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end();
    } else {
      return res.json(
        await getStoriesByKeywords(req.body.keywords.split(","), true)
      );
    }
  },
];
