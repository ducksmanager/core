import axios from "axios";
import sizeOf from "image-size";

import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: {
      dimensions: { width: number; height: number };
      base64: string;
      url: string;
    };
    query: { targetUrl: string };
  }>
) => {
  const targetUrl = req.query.targetUrl;
  const url = targetUrl.startsWith("https://res.cloudinary.com")
    ? targetUrl
    : `${process.env.VITE_EDGES_URL!}/${targetUrl}`;

  const response = await axios.get(url);
  if (response.status === 200) {
    try {
      const buffer = Buffer.from(response.data);
      const dimensions = sizeOf(buffer) as { width: number; height: number };
      const base64 = `data:${
        response.headers["content-type"]
      };base64,${buffer.toString()}`;
      return res.json({ dimensions, base64, url });
    } catch (e) {
      console.error(targetUrl + " : " + e);
      res.writeHead(404);
      return res.end();
    }
  }
};
