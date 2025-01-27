import { XMLParser } from "fast-xml-parser";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import type { Namespace, Server } from "socket.io";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type Events from "./types";
import { namespaceEndpoint } from "./types";
import { getEdgesPath } from "~/index";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

const REGEX_IS_PNG_FILE = /^_?.+\.png$/;

const getSvgMetadata = (
  metadataNodes: { "#text": string; type?: string }[],
  metadataType: string
) =>
  metadataNodes
    .filter(
      ({ type, "#text": text }) =>
        type === metadataType && typeof text === "string"
    )
    .map(({ "#text": text }) => text.trim());

const findInDir = async (dir: string, currentUsername: string) => {
  const existingEdges = await prismaDm.edge.findMany({
      select: {
        publicationcode: true,
        issuecode: true,
      },
    });

    const publicationcodes = existingEdges.map(
      ({ publicationcode }) => publicationcode
    );

    const filteredFiles = [
      ...publicationcodes.map(
        (publicationcode) => publicationcode.split("/")[0]
      ),
    ].map((countrycode) => readdirSync(`${dir}/${countrycode}/gen`, {
      recursive: true,
      withFileTypes: true,
    })
      .filter((file) => REGEX_IS_PNG_FILE.test(file.name))
      .map((file) => {
        const filePath = path.join(file.parentPath, file.name);
        const magazinecodeAndIssuenumber = file.name;
        const [magazinecode, issuenumberShort] = magazinecodeAndIssuenumber.split(".");
        const publicationcode = `${countrycode}/${magazinecode}`;

        const doc = parser.parse(readFileSync(filePath));
        const metadataNodes = doc.svg.metadata;

        const designers = getSvgMetadata(
          metadataNodes,
          "contributor-designer"
        );
        const photographers = getSvgMetadata(
          metadataNodes,
          "contributor-photographer"
        );

        const svgUrl = filePath.replace(".png", ".svg");

        return {
          publicationcode,
          issuenumberShort,
          url: `${process.env.EDGES_URL!}/${filePath}`,
          svgUrl: existsSync(svgUrl) ? svgUrl: undefined,
          designers,
          photographers,
          status: (file.name.startsWith("_")
            ? (designers.includes(currentUsername) ? "ongoing" : "ongoing by another user")
            : "published") as "ongoing" | "ongoing by another user" | "published",
        };
      })).flat()

    const existingIssuecodes = (
      await prismaCoa.inducks_issue.findMany({
        select: {
          publicationcode: true,
          issuecode: true,
          issuenumber: true,
        },
        where: {
          publicationcode: {
            in: publicationcodes,
          },
        },
      })
    )
      .map(({ publicationcode, issuecode, issuenumber }) => ({
        publicationcode,
        issuecode,
        issuenumber,
      }))
      .groupBy("publicationcode", "[]");

    const filesWithInducksIssuecode = filteredFiles
      .map((edge) => ({
        ...edge,
        issuecode: existingIssuecodes[edge.publicationcode].find(
          ({ issuenumber }) =>
            issuenumber.replaceAll(" ", "") === edge.issuenumberShort
        )?.issuecode as string,
      }))
      .filter(({ publicationcode, issuenumberShort, issuecode }) => {
        if (!issuecode) {
          console.warn(
            `No issuecode found for ${publicationcode} ${issuenumberShort}`
          );
        }
        return issuecode;
      });

    return filesWithInducksIssuecode;
}
    

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to browse");

    socket.on("listEdgeModels", async (callback) => {
      findInDir(getEdgesPath(), socket.data.user.username)
        .then((results) => {
          callback({ results });
        })
        .catch((errorDetails) =>
          callback({
            error: "Generic error",
            errorDetails: errorDetails as string,
          })
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
            `${getEdgesPath()}/${country}/${imageType}`
          ).filter((item) =>
            new RegExp(`(?:^|[. ])${magazine}(?:[. ]|$)`).test(item)
          ),
        });
      } catch (_e) {
        callback({ results: [] });
      }
    });
  });
};
