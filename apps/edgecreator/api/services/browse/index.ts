import { readdirSync, statSync } from "fs";
import path from "path";
import type { Namespace, Server } from "socket.io";

import type Events from "./types";
import { namespaceEndpoint } from "./types";
const edgesPath = process.env.EDGES_PATH!.startsWith("/")
  ? process.env.EDGES_PATH!
  : `${process.env.PWD!}/../${process.env.EDGES_PATH!}`;
const REGEX_IS_SVG_FILE = /^_?.+\.svg$/;

const findInDir = (dir: string) => {
  const fileList: {
    current: { filename: string; mtime: string }[];
    published: { filename: string; mtime: string }[];
  } = {
    current: [],
    published: [],
  };
  try {
    const filteredFiles = readdirSync(dir, {
      recursive: true,
      withFileTypes: true,
    }).filter((file) => REGEX_IS_SVG_FILE.test(file.name));
    for (const file of filteredFiles) {
      const filePath = path.join(file.parentPath, file.name);
      if (REGEX_IS_SVG_FILE.test(file.name)) {
        const edgeStatus = file.name.startsWith("_") ? "current" : "published";
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
        .then((results) => {
          callback({ results });
        })
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
