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
  metadataType: string
) =>
  metadataNodes
    .filter(
      ({ type, "#text": text }) =>
        type === metadataType && typeof text === "string"
    )
    .map(({ "#text": text }) => text.trim());

const findInDir = async (dir: string, currentUsername?: string) => {
  const existingEdges = (
    await prismaDm.edge.findMany({
      select: {
        id: true,
        publicationcode: true,
        issuecode: true,
        users_contributions: true,
      },
    })
  )
    .map((edge) => ({
      ...edge,
      shortIssuecode: edge.issuecode.replace(/[ ]+/, " "),
    }))
    .groupBy("publicationcode", "[]");

  const usersById = (await prismaDm.user.findMany()).groupBy("id", "username");

  const publicationcodes = Object.keys(existingEdges);
  const countrycodes = [
    ...new Set(
      publicationcodes.map((publicationcode) => publicationcode.split("/")[0])
    ),
  ];

  const coaIssuecodesByShortIssuecode = (
    await prismaCoa.inducks_issue.findMany({
      select: {
        issuecode: true,
      },
      where: {
        publicationcode: {
          in: publicationcodes,
        },
      },
    })
  )
    .map((issue) => ({
      ...issue,
      shortIssuecode: issue.issuecode.replace(/[ ]+/, " "),
    }))
    .groupBy("shortIssuecode", "issuecode");

  return countrycodes.flatMap((countrycode) => {
    const genDir = `${dir}/${countrycode}/gen`;
    if (!existsSync(genDir)) {
      console.warn("No gen directory found for", countrycode);
      return [];
    }
    console.log("Scanning edges in directory", genDir);
    return readdirSync(genDir, {
      recursive: true,
      withFileTypes: true,
    })
      .filter((file) => /.png$/.test(file.name) || /^_.+.svg$/.test(file.name))
      .flatMap((file) => {
        const filePath = path.join(file.parentPath, file.name);
        const [magazinecode, issuenumberShort] = file.name
          .replace("_", "")
          .split(".");
        const publicationcode = `${countrycode}/${magazinecode}`;

        let svgFileName: string | undefined;
        let isPending = false;
        let edge: (typeof existingEdges)[string][number] | undefined;
        let designers: string[] = [];
        let photographers: string[] = [];

        if (/.png$/.test(file.name)) {
          const potentialSvgFileName = filePath.replace(".png", ".svg");
          if (existsSync(potentialSvgFileName)) {
            svgFileName = potentialSvgFileName;

            edge = existingEdges[publicationcode]?.find(
              ({ shortIssuecode }) =>
                shortIssuecode === `${publicationcode} ${issuenumberShort}`
            );
            if (!edge) {
              // Auto-generated edge image
              return [];
            }
            designers = edge.users_contributions
              .filter(({ contribution }) => contribution === "createur")
              .map(({ userId }) => usersById[userId]);
            photographers = edge.users_contributions
              .filter(({ contribution }) => contribution === "photographe")
              .map(({ userId }) => usersById[userId]);
          }
        } else {
          svgFileName = filePath;
          isPending = true;
        }

        if (svgFileName) {
          const doc = parser.parse(readFileSync(svgFileName));
          const metadataNodes = doc.svg.metadata || [];

          if (!Array.isArray(metadataNodes)) {
            console.warn(
              "Invalid metadata nodes found in SVG file",
              svgFileName,
              metadataNodes
            );
            return [];
          }

          designers = getSvgMetadata(metadataNodes, "contributor-designer");
          photographers = getSvgMetadata(
            metadataNodes,
            "contributor-photographer"
          );
        }

        return {
          edgeId: edge?.id,
          issuecode: coaIssuecodesByShortIssuecode[issuenumberShort],
          publicationcode,
          issuenumberShort,
          url: `${genDir}/${filePath}`,
          svgUrl: `${genDir}/${svgFileName}`,
          designers,
          photographers,
          ...({
            status: isPending
              ? currentUsername && designers.includes(currentUsername)
                ? "Ongoing"
                : designers.length
                  ? "Ongoing by another user"
                  : "Pending"
              : "Published",
          } as const),
        };
      });
  });
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

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>("/browse", {
  listenEvents,
  middlewares: [OptionalAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
