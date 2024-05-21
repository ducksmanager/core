import { exec } from "child_process";
import type { Request, Response } from "express";
import { readFileSync } from "fs";
import { pipeline } from "stream";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With," +
    "If-Modified-Since,Cache-Control,Content-Type,x-dm-user,x-dm-pass",
};
export const get = (req: Request, res: Response) => {
  const { countrycode, magazinecode, issuenumber, extension } = req.params!;

  if (countrycode && extension !== "png") {
    res.writeHead(404, corsHeaders);
    res.end("");
    return;
  }
  const text = `${countrycode}/${magazinecode} ${issuenumber}`;

  const convert = exec("convert svg:- png:-", {
    encoding: "buffer",
  });

  convert.stdin!.write(
    Buffer.from(
      readFileSync("assets/default.svg")
        .toString()
        .replace("My text", decodeURIComponent(text)),
      "utf8"
    )
  );
  convert.stdin!.end();

  res.setHeader("Content-Type", "image/png");

  pipeline(convert.stdout!, res, (err) => {
    if (err) {
      console.error("Pipeline failed", err);
      res.status(500).send("Conversion failed");
    }
  });
};

export const options = (req: Request, res: Response) => {
  res.writeHead(200, corsHeaders);
  return res.end();
};
