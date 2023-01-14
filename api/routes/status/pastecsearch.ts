import axios from "axios";
import * as fs from "fs";

import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

export type getCall = Call<{ status: string | number }>;
export const get = async (...[, res]: ExpressCall<getCall>) => {
  const response = (
    await axios.post(
      process.env.PASTEC_HOSTS + "/searcher",
      fs.readFileSync(
        `${process.env.IMAGE_REMOTE_ROOT}/au/bp/001/au_bp_001a_001.jpg`
      )
    )
  ).data;
  if (response) {
    const imageIds: number[] = JSON.parse(response)?.imageIds;
    if (imageIds) {
      if (imageIds.length) {
        return res.json({ status: imageIds.length });
      } else {
        return res.json({ status: "Pastec search returned no image" });
      }
    } else {
      res.writeHead(500);
      res.json({ status: "Pastec /searcher response is invalid" });
    }
  } else {
    res.writeHead(500);
    res.json({ status: "Pastec is unreachable" });
  }
};
