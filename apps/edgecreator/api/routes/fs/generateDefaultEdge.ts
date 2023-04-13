import fs from "fs";
import sharp from "sharp";

import { ExpressCall } from "~routes/_express-call";
// eslint-disable-next-line max-len
const REGEX_EDGE_URL =
  /^edges\/(?<countryCode>[^/]+)\/gen\/_?(?<magazineCode>[^.]+)\.(?<issueNumber>[^.]+)\.(?<extension>[^?]+)?(?:\?.+)?$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With," +
    "If-Modified-Since,Cache-Control,Content-Type,x-dm-user,x-dm-pass",
};
export const get = (
  ...[req, res]: ExpressCall<{
    resBody: {
      current: string[];
      published: string[];
    };
  }>
) => {
  const input = req.url.replace(/^\//, "");
  let text;
  const match = input.match(REGEX_EDGE_URL);
  if (match) {
    const { countryCode, magazineCode, issueNumber, extension } = match.groups!;

    if (countryCode && extension !== "png") {
      res.writeHead(404, corsHeaders);
      res.end("");
      return;
    }
    text = `${countryCode}/${magazineCode} ${issueNumber}`;
  } else {
    text = input;
  }

  const content = Buffer.from(
    fs
      .readFileSync("assets/default.svg")
      .toString()
      .replace("My text", decodeURIComponent(text)),
    "utf8"
  );
  sharp(content).toBuffer((error, buffer) => {
    if (error) {
      res.writeHead(500, corsHeaders);
      return res.end(`Error : ${JSON.stringify({ error })}`);
    }
    res.writeHead(200, { ...corsHeaders, "Content-Type": "image/png" });
    return res.end(buffer);
  });
};

export const options = (
  ...[, res]: ExpressCall<{
    resBody: {
      current: string[];
      published: string[];
    };
  }>
) => {
  res.writeHead(200, corsHeaders);
  return res.end();
};
