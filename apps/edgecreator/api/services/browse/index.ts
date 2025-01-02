import { XMLParser } from "fast-xml-parser";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

type EdgeModelDetails = {
  issuecode: string;
  url: string;
  designers: string[];
  photographers: string[];
}

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
  metadataType: string
) =>
  metadataNodes
    .filter(({ type }) => type === metadataType)
    .map(({ "#text": text }) => text.trim());

const findInDir = (dir: string) =>
  new Promise<{
    current: EdgeModelDetails[];
    published: EdgeModelDetails[];
  }>(async (resolve, reject) => {
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
        const filename = filePath.replace(/.+\/edges\//, "");
        const [countrycode, magazinecodeAndIssuenumber] =
          filename.split("/gen/");
        const [magazinecode, issuenumberShort] =
          magazinecodeAndIssuenumber.split(".");
        const publicationcode = `${countrycode}/${magazinecode}`;
        const [{ issuecode }] = await prismaCoa.$queryRaw<
          { issuecode: string }[]
        >`
            SELECT issuecode
            FROM inducks_issue
            WHERE publicationcode = ${publicationcode}
            AND REPLACE(issuenumber, ' ', '') = ${issuenumberShort}`;
        const edgeStatus = file.name.startsWith("_") ? "current" : "published";

        const doc = parser.parse(readFileSync(filePath));
        const metadataNodes = doc.svg.metadata;

        const designers = getSvgMetadata(metadataNodes, "contributor-designer");
        const photographers = getSvgMetadata(
          metadataNodes,
          "contributor-photographer"
        );

        fileList[edgeStatus].push({
          issuecode,
          url: `${process.env.EDGES_URL!}/${filePath}`,
          designers,
          photographers,
        });
        resolve(fileList);
      }
    } catch (e) {
      return reject(e);
    }
  });

export default () => ({
  listEdgeModels: async () =>
    new Promise((resolve) => {
      findInDir(edgesPath)
        .then((results) => {
          resolve({ results });
        })
        .catch((errorDetails) =>
          resolve({
            error: "Generic error",
            errorDetails: errorDetails as string,
          })
        );
    }),

  listEdgeParts: async (parameters: {
    imageType: "elements" | "photos";
    country: string;
    magazine: string;
  }) => {
    const { country, imageType, magazine } = parameters;
    if (
      !/^(elements)|(photos)$/.test(imageType) ||
      !/^[a-z]+$/.test(country) ||
      !/^[-A-Z0-9]+$/.test(magazine)
    ) {
      return { error: "Invalid parameters" };
    }
    try {
      return {
        results: readdirSync(
          `${process.env.EDGES_PATH!}/${country}/${imageType}`
        ).filter((item) =>
          new RegExp(`(?:^|[. ])${magazine}(?:[. ]|$)`).test(item)
        ),
      };
    } catch (_e) {
      return { results: [] };
    }
  },
});
