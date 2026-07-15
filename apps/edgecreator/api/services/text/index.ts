import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { v2 as cloudinary } from "cloudinary";
import { useSocketEvents } from "socket-call-server";

const execFileAsync = promisify(execFile);

cloudinary.config(true);

const sessionHashes: Record<string, string> = {};

const CURL_IMPERSONATE_CHROME = "curl_chrome116";

const fetchPage = async (url: string) => {
  const { stdout } = await execFileAsync(
    CURL_IMPERSONATE_CHROME,
    ["-sS", "-w", "\n%{http_code}", "--", url],
    { maxBuffer: 16 * 1024 * 1024 },
  );
  const lastNewline = stdout.lastIndexOf("\n");
  const status = Number(stdout.slice(lastNewline + 1).trim());
  const body = stdout.slice(0, lastNewline);
  if (status < 200 || status >= 300) {
    throw new Error(`Font provider returned HTTP ${status} for ${url}`);
  }
  return body;
};

const fetchSessionHash = async (parameters: { font: string }) => {
  if (sessionHashes[parameters.font]) {
    return;
  }
  const url = parameters.font.includes("/")
    ? process.env.FONT_BASE_URL!
    : `${process.env.FONT_PRODUCT_BASE_URL!}${parameters.font}`;
  const data = await fetchPage(url);
  const regex = `(?<=md5=")[a-z\\d]+`;
  const sessionHashMatch = data.match(new RegExp(regex));
  if (sessionHashMatch) {
    sessionHashes[parameters.font] = sessionHashMatch[0];
  } else {
    throw new Error(
      `No session ID found in URL ${url}, regex: ${regex}`,
    );
  }
};

const generateImage = (parameters: {
  color: string;
  colorBackground: string;
  width: number;
  font: string;
  text: string;
}) =>
  fetchSessionHash(parameters).then(() => {
    const url = `${process.env.FONT_IMAGE_GEN_URL!}${sessionHashes[parameters.font]}?${new URLSearchParams(
      {
        rbe: "fixed",
        rt: parameters.text,
        fg: parameters.color,
        bg: parameters.colorBackground,
      },
    ).toString()}`;
    console.log(`Generating text image: url=${url}`);
    return cloudinary.uploader.upload(
      url,
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
    );
  });

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
    new Promise((resolve) => {
      const { color, colorBackground, width, font, text } = parameters;
      const context: Record<string, number | string> = {
        color,
        colorBackground,
        width,
        text,
      };
      cloudinary.search
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
          resolve({
            error: "Image generation error",
            errorDetails: e.message,
          });
        });
    }),
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>("/text", {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
