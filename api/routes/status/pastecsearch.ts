import axios from "axios";
import { Handler, Response } from "express";
import * as fs from "fs";

export type getType = string;
export const get: Handler = async (req, res: Response<getType>) => {
  const response = (
    await axios.post(
      process.env.PASTEC_HOSTS + "/searcher",
      fs.readFileSync(
        `${process.env.IMAGE_REMOTE_ROOT}/au/bp/001/au_bp_001a_001.jpg`
      )
    )
  ).data;
  if (response) {
    const imageIds = JSON.parse(response)?.imageIds;
    if (imageIds) {
      if (imageIds.length) {
        res.writeHead(200, { "Content-Type": "application/text" });
        res.end(imageIds.length);
      } else {
        res.writeHead(200, { "Content-Type": "application/text" });
        res.end("Pastec search returned no image");
      }
    } else {
      res.writeHead(500, { "Content-Type": "application/text" });
      res.end("Pastec /searcher response is invalid");
    }
  } else {
    res.writeHead(500, { "Content-Type": "application/text" });
    res.end("Pastec is unreachable");
  }
};
