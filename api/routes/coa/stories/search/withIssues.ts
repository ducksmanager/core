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
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          await getStoriesByKeywords(req.body.keywords.split(","), true)
        )
      );
    }
  }) as Handler,
];
