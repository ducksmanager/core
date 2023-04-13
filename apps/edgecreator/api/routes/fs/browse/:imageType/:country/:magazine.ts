import fs from "fs";

import { ExpressCall } from "~routes/_express-call";

export const get = (
  ...[req, res]: ExpressCall<{
    params: {
      imageType: "elements" | "photos";
      country: string;
      magazine: string;
    };
    resBody: string[];
  }>
) => {
  const { country, imageType, magazine } = req.params;
  if (
    !/^(elements)|(photos)$/.test(imageType) ||
    !/^[a-z]+$/.test(country) ||
    !/^[-A-Z0-9]+$/.test(magazine)
  ) {
    res.writeHead(400);
    return res.end();
  }
  try {
    return res.json(
      fs
        .readdirSync(`${process.env.EDGES_PATH!}/${country}/${imageType}`)
        .filter((item) =>
          new RegExp(`(?:^|[. ])${magazine}(?:[. ]|$)`).test(item)
        )
    );
  } catch (e) {
    return res.json([]);
  }
};
