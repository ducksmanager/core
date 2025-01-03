import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

import { useSocketServices } from "~socket.io-services/index";

const sessionHashes: Record<string, string> = {};

const generateImage = (parameters: {
  color: string;
  colorBackground: string;
  width: number;
  font: string;
  text: string;
}) =>
  axios
    .get(
      parameters.font.includes("/")
        ? process.env.FONT_BASE_URL!
        : `${process.env.FONT_PRODUCT_BASE_URL!}${parameters.font}`,
    )
    .then(({ data }: { data: string }) => {
      const sessionHashMatch = data.match(/(?<=font_rend.php\?id=)[a-z\d]+/);
      if (sessionHashMatch) {
        sessionHashes[parameters.font] = sessionHashMatch[0];
      } else {
        throw new Error(
          `No session ID found in URL ${process.env.FONT_BASE_URL!}${
            parameters.font
          }`,
        );
      }
    })
    .catch((response: Error) => Promise.reject(response))
    .then(() =>
      cloudinary.uploader.upload(
        `${process.env.FONT_IMAGE_GEN_URL!}?${new URLSearchParams({
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
          Promise.resolve({ width, height, url });
        },
      ),
    );

const listenEvents = () => ({
  getText: (parameters: {
    color: string;
    colorBackground: string;
    width: number;
    font: string;
    text: string;
  }): Promise<
    | {
        error: "Image generation error";
        errorDetails: string;
      }
    | { results: { width: number; height: number; url: string } }
  > =>
    new Promise(async (resolve) => {
      const { color, colorBackground, width, font, text } = parameters;
      const context: Record<string, number | string> = {
        color,
        colorBackground,
        width,
        text,
      };
      await cloudinary.search
        .expression(
          `tags=${font} AND ${Object.keys(context)
            .reduce<string[]>(
              (acc, key) => [
                ...acc,
                `context.${key}="${String(context[key])}"`,
              ],
              [],
            )
            .join(" AND ")}`,
        )
        .execute()
        .then(
          ({
            resources,
          }: {
            resources: {
              width: number;
              height: number;
              secure_url: string;
            }[];
          }) => {
            if (resources.length) {
              console.log(`Found an existing text`);
              const { width, height, secure_url: url } = resources[0];
              resolve({ results: { width, height, url } });
            } else {
              console.log(`Found no existing text, generating text image...`);
              generateImage(parameters)
                .then(({ width, height, secure_url: url }) => {
                  console.log(`Text image generated: url=${url}`);
                  resolve({ results: { width, height, url } });
                })
                .catch((response: Error) => {
                  resolve({
                    error: "Image generation error",
                    errorDetails: response.message,
                  });
                });
            }
          },
        )
        .catch((e) => {
          console.error(e);
        });
    }),
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { token: string }
>("/save", {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
