import bodyParser from "body-parser";
import { Handler } from "express";

import { getStoriesByKeywords } from "./index";

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  (async (req, res) => {
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
