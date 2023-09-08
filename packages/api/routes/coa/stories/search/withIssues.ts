import bodyParser from "body-parser";
import { StorySearchResults } from "types/StorySearchResults";

import { ExpressCall } from "~routes/_express-call";

import { getStoriesByKeywords } from "./index";

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      resBody: StorySearchResults;
      reqBody: { keywords: string };
    }>
  ) => {
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
