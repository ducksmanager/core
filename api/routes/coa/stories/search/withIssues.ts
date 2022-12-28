import { PromiseReturnType } from "@prisma/client/scripts/default-index";
import bodyParser from "body-parser";
import { Handler, Response } from "express";

import { getStoriesByKeywords } from "./index";

const parseForm = bodyParser.json();

export type postType = PromiseReturnType<typeof getStoriesByKeywords>;

export const post = [
  parseForm,
  (async (req, res: Response<postType>) => {
    if (!req.body.keywords) {
      res.writeHead(400, { "Content-Type": "application/text" });
      res.end();
    } else {
      return res.json(
        await getStoriesByKeywords(req.body.keywords.split(","), true)
      );
    }
  }) as Handler,
];
