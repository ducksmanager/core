import { XMLParser } from "fast-xml-parser";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import type { Namespace, Server } from "socket.io";

import type Events from "./types";
import type { EdgeModelDetails } from "./types";
import { namespaceEndpoint } from "./types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

const edgesPath = process.env.EDGES_PATH!.startsWith("/")
  ? process.env.EDGES_PATH!
  : `${process.env.PWD!}/../${process.env.EDGES_PATH!}`;
const REGEX_IS_SVG_FILE = /^_?.+\.svg$/;

const getSvgMetadata = (
  metadataNodes: { "#text": string; type?: string }[],
  metadataType: string,
) =>
  metadataNodes
    .filter(({ type }) => type === metadataType)
    .map(({ "#text": text }) => text.trim());

const findInDir = (dir: string) =>
  new Promise<{
    current: EdgeModelDetails[];
    published: EdgeModelDetails[];
  }>((resolve, reject) => {
    const fileList: {
      current: EdgeModelDetails[];
      published: EdgeModelDetails[];
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
        const edgeStatus = file.name.startsWith("_") ? "current" : "published";

        const doc = parser.parse(readFileSync(filePath));
        const metadataNodes = doc.svg.metadata;

        const designers = getSvgMetadata(metadataNodes, "contributor-designer");
        const photographers = getSvgMetadata(
          metadataNodes,
          "contributor-photographer",
        );

        fileList[edgeStatus].push({
          filename: filePath.replace(/.+\/edges\//, ""),
          designers,
          photographers,
        });
        resolve(fileList);
      }
    } catch (e) {
      return reject(e);
    }
  });

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
