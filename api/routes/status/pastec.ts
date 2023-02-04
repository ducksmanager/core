import axios from "axios";

import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[, res]: ExpressCall<{ status: string | number }>
) => {
  const response = (await axios.get(process.env.PASTEC_HOSTS + "/imageIds"))
    .data;
  if (response) {
    const imageIds = JSON.parse(response)?.image_ids;
    if (imageIds) {
      return res.end(imageIds.length);
    } else {
      res.writeHead(500);
      return res.json({ status: "Pastec /imageIds response is invalid" });
    }
  } else {
    res.writeHead(500);
    return res.json({ status: "Pastec is unreachable" });
  }
};
