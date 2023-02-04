import bodyParser from "body-parser";

import { ExpressCall } from "~routes/_express-call";
import { StorySearchResults } from "~types/StorySearchResults";

import { getStoriesByKeywords } from "./index";

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<
      StorySearchResults,
      undefined,
      { keywords: string }
    >
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
