import { readdirSync, statSync } from "fs";
import path from "path";
import type { Namespace, Server } from "socket.io";

import type Events from "./types";
import { namespaceEndpoint } from "./types";
const edgesPath = `${process.env.PWD!}/../${process.env.EDGES_PATH!}`;
const REGEX_IS_BROWSABLE_FILE = /^[-+(). _A-Za-z\d]+$/;
const REGEX_IS_SVG_FILE = /^_?.+\.svg$/;

const findInDir = (dir: string) => {
  const fileList = {
    current: [] as { filename: string; mtime: string }[],
    published: [] as { filename: string; mtime: string }[],
  };
  try {
    const files = readdirSync(dir);
    const filteredFiles = files.filter((file) =>
      REGEX_IS_BROWSABLE_FILE.test(file),
    );
    for (const file of filteredFiles) {
      const filePath = path.join(dir, file);
      if (!file.includes(".")) {
        findInDir(filePath);
      } else if (REGEX_IS_SVG_FILE.test(file)) {
        const edgeStatus = file.startsWith("_") ? "current" : "published";
        fileList[edgeStatus].push({
          filename: filePath.replace(/.+\/edges\//, ""),
          mtime: statSync(filePath).mtime.toISOString(),
        });
      }
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve(fileList);
};

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to browse");

    socket.on("listEdgeModels", async (callback) => {
      findInDir(edgesPath)
        .then((results) => callback({ results }))
        .catch((errorDetails) =>
          callback({
            error: "Generic error",
            errorDetails: errorDetails as string,
          }),
        );
    });

    socket.on("listEdgeParts", async (parameters, callback) => {
      const { country, imageType, magazine } = parameters;
      if (
        !/^(elements)|(photos)$/.test(imageType) ||
        !/^[a-z]+$/.test(country) ||
        !/^[-A-Z0-9]+$/.test(magazine)
      ) {
        callback({ error: "Invalid parameters" });
      }
      try {
        callback({
          results: readdirSync(
            `${process.env.EDGES_PATH!}/${country}/${imageType}`,
          ).filter((item) =>
            new RegExp(`(?:^|[. ])${magazine}(?:[. ]|$)`).test(item),
          ),
        });
      } catch (e) {
        callback({ results: [] });
      }
    });
  });
};
