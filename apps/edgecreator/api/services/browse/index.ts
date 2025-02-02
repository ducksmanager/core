import { XMLParser } from "fast-xml-parser";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { OptionalAuthMiddleware } from "~dm-services/auth/util";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { SessionData } from "../../index";
import { getEdgesPath } from "../../index";

export type BrowseServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, SessionData>,
  Record<string, never>
>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
});

const REGEX_IS_PNG_FILE = /^_?.+\.png$/;

const getSvgMetadata = (
  metadataNodes: { "#text": string; type?: string }[],
  metadataType: string,
) =>
  metadataNodes
    .filter(
      ({ type, "#text": text }) =>
        type === metadataType && typeof text === "string",
    )
    .map(({ "#text": text }) => text.trim());

const findInDir = async (dir: string, currentUsername?: string) => {
  const existingEdges = (
    await prismaDm.edge.findMany({
      select: {
        id: true,
        publicationcode: true,
        issuecode: true,
      },
    })
  ).groupBy("publicationcode", "[]");

  const publicationcodes = Object.keys(existingEdges);

  const filteredFiles = [
    ...new Set(
      publicationcodes.map((publicationcode) => publicationcode.split("/")[0]),
    ),
  ]
    .map((countrycode) =>
      !existsSync(`${dir}/${countrycode}/gen`)
        ? []
        : readdirSync(`${dir}/${countrycode}/gen`, {
            recursive: true,
            withFileTypes: true,
          })
            .filter((file) => REGEX_IS_PNG_FILE.test(file.name))
            .flatMap((file) => {
              const filePath = path.join(file.parentPath, file.name);
              const magazinecodeAndIssuenumber = file.name;
              const [magazinecode, issuenumberShort] =
                magazinecodeAndIssuenumber.split(".");
              const publicationcode = `${countrycode}/${magazinecode}`;

              const doc = parser.parse(readFileSync(filePath));
              const metadataNodes = doc.svg.metadata;

              const designers = getSvgMetadata(
                metadataNodes,
                "contributor-designer",
              );
              const photographers = getSvgMetadata(
                metadataNodes,
                "contributor-photographer",
              );

              const svgUrl = filePath.replace(".png", ".svg");

              const issue = existingEdges[publicationcode]?.find(
                ({ issuecode }) =>
                  issuecode.replaceAll(" ", "") ===
                  `${publicationcode}${issuenumberShort}`,
              );

              if (!issue) {
                console.warn(
                  `Issue ${publicationcode}${issuenumberShort} not found in database`,
                );
                return [];
              }

              return {
                id: issue.id,
                publicationcode,
                issuenumberShort,
                url: `${process.env.EDGES_URL!}/${filePath}`,
                svgUrl: existsSync(svgUrl) ? svgUrl : undefined,
                designers,
                photographers,
                ...({
                  status: file.name.startsWith("_")
                    ? currentUsername && designers.includes(currentUsername)
                      ? "Ongoing"
                      : designers.length
                        ? "Ongoing by another user"
                        : "Pending"
                    : "Published",
                } as const),
              };
            }),
    )
    .filter((edge) => !!edge)
    .flat();

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

  const filesWithInducksIssuecode = filteredFiles.flatMap((edge) => {
    const issuecode = existingIssuecodes[edge.publicationcode].find(
      ({ issuenumber }) =>
        issuenumber.replaceAll(" ", "") === edge.issuenumberShort,
    )?.issuecode;
    if (!issuecode) {
      console.warn(
        `No issuecode found for ${edge.publicationcode} ${edge.issuenumberShort}`,
      );
      return [];
    }
    return {
      ...edge,
      issuecode,
    };
  });

  return filesWithInducksIssuecode;
};

const listenEvents = (services: BrowseServices) => ({
  listEdgeModels: async (): Promise<
    | {
        error: "Generic error";
        errorDetails: string;
      }
    | { results: Awaited<ReturnType<typeof findInDir>> }
  > =>
    new Promise((resolve) => {
      findInDir(getEdgesPath(), services._socket.data.user?.username)
        .then((results) => {
          resolve({ results });
        })
        .catch((errorDetails) =>
          {
            console.error(errorDetails);
            return resolve({
              error: "Generic error",
              errorDetails: errorDetails as string,
            });
          },
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
          `${process.env.EDGES_PATH!}/${country}/${imageType}`,
        ).filter((item) =>
          new RegExp(`(?:^|[. ])${magazine}(?:[. ]|$)`).test(item),
        ),
      };
    } catch (_e) {
      return { results: [] };
    }
  },
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>("/browse", {
  listenEvents,
  middlewares: [OptionalAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
