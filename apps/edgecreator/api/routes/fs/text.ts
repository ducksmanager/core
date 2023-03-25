import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

import { ExpressCall } from "~routes/_express-call";

const sessionHashes: Record<string, string> = {};

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: {
      width: number;
      height: number;
      url: string;
    };
    query: {
      color: string;
      colorBackground: string;
      width: number;
      font: string;
      text: string;
    };
  }>
) => {
  const { color, colorBackground, width, font, text } = req.query;
  const context: Record<string, number | string> = {
    color,
    colorBackground,
    width,
    text,
  };
  cloudinary.search
    .expression(
      `tags=${font} AND ${Object.keys(context)
        .reduce(
          (acc, key) => [...acc, `context.${key}="${String(context[key])}"`],
          [] as string[]
        )
        .join(" AND ")}`
    )
    .execute()
    .then(({ resources }) => {
      if (resources.length) {
        console.log(`Found an existing text`);
        const { width, height, secure_url: url } = resources[0];
        return res.json({ width, height, url });
      } else {
        console.log(`Found no existing text, generating text image...`);
        generateImage(req.query)
          .then(({ width, height, secure_url: url }) => {
            console.log(`Text image generated: url=${url}`);
            return res.json({ width, height, url });
          })
          .catch((response) => {
            res.writeHead(response.status);
            res.end();
          });
      }
    });
};

const generateImage = (parameters: {
  color: string;
  colorBackground: string;
  width: number;
  font: string;
  text: string;
}) =>
  axios
    .get(
      (parameters.font.includes("/")
        ? process.env.FONT_BASE_URL
        : process.env.FONT_PRODUCT_BASE_URL) + parameters.font
    )
    .then(({ data }) => {
      const sessionHashMatch = data.match(/(?<=font_rend.php\?id=)[a-z\d]+/);
      if (sessionHashMatch) {
        sessionHashes[parameters.font] = sessionHashMatch[0];
      } else {
        throw new Error(
          `No session ID found in URL ${process.env.FONT_BASE_URL}${parameters.font}`
        );
      }
    })
    .then(() =>
      cloudinary.uploader.upload(
        `${process.env.FONT_IMAGE_GEN_URL}?${new URLSearchParams({
          id: sessionHashes[parameters.font],
          rbe: "fixed",
          rt: parameters.text,
          fg: parameters.color,
          bg: parameters.colorBackground,
        }).toString()}`,
        {
          folder: "texts",
          async: false,
          tags: [parameters.font],
          context: parameters,
        },
        (error, result) => {
          if (error) {
            console.error(error);
          }
          const { width, height, secure_url: url } = result!;
          return new Promise((resolve) => resolve({ width, height, url }));
        }
      )
    );
