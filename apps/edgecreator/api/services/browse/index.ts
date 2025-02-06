import { XMLParser } from "fast-xml-parser";
import { existsSync, readdirSync, readFileSync } from "fs";
import path from "path";
import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { OptionalAuthMiddleware } from "~dm-services/auth/util";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

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

const findPublishedEdges = async (publicationcode: string) => {
  const [countrycode, magazinecode] = publicationcode.split("/");
  const existingEdges = (
    await prismaDm.edge.findMany({
      select: {
        id: true,
        issuecode: true,
      },
      where: {
        publicationcode,
      },
    })
  )
    .map((edge) => ({
      ...edge,
      shortIssuecode: edge.issuecode.replace(/[ ]+/, " "),
    }))
    .groupBy("shortIssuecode");

  const coaIssuecodesByShortIssuecode = (
    await prismaCoa.inducks_issue.findMany({
      select: {
        issuecode: true,
      },
      where: {
        publicationcode,
      },
    })
  )
    .map((issue) => ({
      ...issue,
      shortIssuecode: issue.issuecode.replace(/[ ]+/, " "),
    }))
    .groupBy("shortIssuecode", "issuecode");

  const genDir = `${getEdgesPath()}/${countrycode}/gen`;
  if (!existsSync(genDir)) {
    console.warn("No gen directory found for", countrycode);
    return [];
  }
  console.log("Scanning edges in directory", genDir);
  return readdirSync(genDir, {
    withFileTypes: true,
  })
    .filter((file) => new RegExp(`^${magazinecode}\..+\.png$`).test(file.name))
    .flatMap((file) => {
      const filePath = path.join(file.parentPath, file.name);
      const [magazinecode, issuenumberShort] = file.name.split(".");
      const publicationcode = `${countrycode}/${magazinecode}`;
      const shortIssuecode = `${publicationcode} ${issuenumberShort}`;

      let svgUrl: string | undefined;
      const edge = existingEdges[`${publicationcode} ${issuenumberShort}`];
      if (!edge) {
        // Auto-generated edge image
        return [];
      }

      const potentialSvgPath = filePath.replace(".png", ".svg");
      if (existsSync(potentialSvgPath)) {
        svgUrl = potentialSvgPath.replace(/^.+\/edges\//, '')
      }

      return {
        id: edge.id,
        issuecode: coaIssuecodesByShortIssuecode[shortIssuecode],
        publicationcode,
        url: filePath.replace(/^.+\/edges\//, ''),
        svgUrl,
      };
    })
    .groupBy("issuecode");
};

const findOngoingEdges = async (currentUsername?: string) => {
  const edges = readdirSync(getEdgesPath(), {
    withFileTypes: true,
  })
    .filter(
      (file) =>
        file.isDirectory() && existsSync(`${getEdgesPath()}/${file.name}/gen`),
    )
    .flatMap((countryDir) => {
      const genDir = `${getEdgesPath()}/${countryDir.name}/gen`;
      console.log("Scanning edges in directory", genDir);
      const edges = readdirSync(genDir, {
        recursive: true,
        withFileTypes: true,
      })
        .filter((file) => /^_.+.svg$/.test(file.name))
        .flatMap((file) => {
          const filePath = path.join(file.parentPath, file.name);
          const [magazinecode, issuenumberShort] = file.name
            .replace("_", "")
            .split(".");
          const publicationcode = `${countryDir.name}/${magazinecode}`;
          const shortIssuecode = `${publicationcode} ${issuenumberShort}`;

          const doc = parser.parse(readFileSync(filePath));
          const metadataNodes = doc.svg.metadata || [];

          if (!Array.isArray(metadataNodes)) {
            console.warn(
              "Invalid metadata nodes found in SVG file",
              file.name,
              metadataNodes,
            );
            return [];
          }

          const designers = getSvgMetadata(
            metadataNodes,
            "contributor-designer",
          );
          const photographers = getSvgMetadata(
            metadataNodes,
            "contributor-photographer",
          );

          return {
            shortIssuecode,
            designers,
            publicationcode,
            photographers,
            svgUrl: `${countryDir.name}/gen/${file.name}`,
            ...({
              status:
                currentUsername && designers.includes(currentUsername)
                  ? "Ongoing"
                  : designers.length
                    ? "Ongoing by another user"
                    : "Pending edition",
            } as const),
          };
        });
      return edges;
    });

  const coaIssuecodesByShortIssuecode = (
    await prismaCoa.inducks_issue.findMany({
      select: {
        issuecode: true,
      },
      where: {
        publicationcode: {
          in: [...new Set(edges.map((edge) => edge.publicationcode))],
        },
      },
    })
  )
    .map((issue) => ({
      ...issue,
      shortIssuecode: issue.issuecode.replace(/[ ]+/, " "),
    }))
    .groupBy("shortIssuecode", "issuecode");

  return edges
    .map(({ shortIssuecode, ...edge }) => ({
      ...edge,
      issuecode: coaIssuecodesByShortIssuecode[shortIssuecode],
    }))
    .filter(({ issuecode }) => !!issuecode)
    .groupBy("issuecode");
};

const listenEvents = (services: BrowseServices) => ({
  listPublishedEdgeModels: async (
    publicationcode: string,
  ): Promise<
    | {
        error: "Generic error";
        errorDetails: string;
      }
    | { results: Awaited<ReturnType<typeof findPublishedEdges>> }
  > =>
    new Promise((resolve) => {
      findPublishedEdges(publicationcode)
        .then((results) => {
          resolve({ results });
        })
        .catch((errorDetails) => {
          console.error(errorDetails);
          return resolve({
            error: "Generic error",
            errorDetails: errorDetails as string,
          } as const);
        });
    }),
  listOngoingEdgeModels: async (): Promise<
    | {
        error: "Generic error";
        errorDetails: string;
      }
    | { results: Awaited<ReturnType<typeof findOngoingEdges>> }
  > =>
    new Promise((resolve) => {
      findOngoingEdges(services._socket.data.user?.username)
        .then((results) => {
          resolve({ results });
        })
        .catch((errorDetails) => {
          console.error(errorDetails);
          return resolve({
            error: "Generic error",
            errorDetails: errorDetails as string,
          } as const);
        });
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
          `${getEdgesPath()}/${country}/${imageType}`,
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
