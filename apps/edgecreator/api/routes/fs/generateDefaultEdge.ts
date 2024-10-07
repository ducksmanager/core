import { exec } from "child_process";
import { readFileSync } from "fs";
import { pipeline } from "stream";

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
  const convert = exec("convert svg:- png:-", {
    encoding: "buffer",
  });

  convert.stdin!.write(
    Buffer.from(
      readFileSync("assets/default.svg")
        .toString()
        .replace("My text", decodeURIComponent(text)),
      "utf8",
    ),
  );
  convert.stdin!.end();

  res.setHeader("Content-Type", "image/png");

  pipeline(convert.stdout!, res, (err) => {
    if (err) {
      console.error("Pipeline failed", err);
      res.writeHead(500, corsHeaders);
    }
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
