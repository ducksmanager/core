import { exec } from "child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import type { Socket } from "socket.io";

import { getSvgPath } from "../../_utils";
import {
  type ClientEvents as EdgeCreatorServices,
  endpoint as edgeCreatorServicesEndpoint,
} from "~dm-services/edgecreator";
import { SocketClient } from "~socket.io-client-services";
import { useSocketServices } from "~socket.io-services/index";
import type { ExportPaths } from "~types/ExportPaths";

import { ModelContributor } from "~types/ModelContributor";

type TokenSocket = Socket<object, object, object, { token: string }>;

const getEdgeCreatorServices = (token: string) => {
  const dmSocket = new SocketClient(process.env.DM_SOCKET_URL!);
  dmSocket.onConnectError = (e) => console.error(e);
  return dmSocket.addNamespace<EdgeCreatorServices>(
    edgeCreatorServicesEndpoint,
    {
      session: {
        getToken: async () => token,
        sessionExists: () => Promise.resolve(!!token),
        clearSession: () => {
          console.log("not allowed");
        },
      },
    }
  ).services;
};

const listenEvents = (socket: TokenSocket) => ({
  saveEdge: async (parameters: {
    runExport: boolean;
    runSubmit: boolean;
    issuecode: string;
    contributors: ModelContributor[];
    content: string;
  }) => {
    const { token } = socket.handshake.auth;
    const { runExport, runSubmit, issuecode, contributors, content } =
      parameters;
    const svgPath = await getSvgPath(runExport, issuecode);

    mkdirSync(path.dirname(svgPath), { recursive: true });
    writeFileSync(svgPath, content);
    let paths: ExportPaths = { svgPath };
    if (runExport) {
      const pngPath = svgPath.replace(".svg", ".png");

      exec(`convert ${svgPath} ${pngPath}`);

      paths = { ...paths, pngPath };

      const designers = contributors
        .filter(({ contributionType }) => contributionType === "createur")
        .map(({ user }) => user.username);

      const photographers = contributors
        .filter(({ contributionType }) => contributionType === "photographe")
        .map(({ user }) => user.username);

      const publicationResult = await getEdgeCreatorServices(token).publishEdge(
        {
          issuecode,
          designers,
          photographers,
        }
      );
      if ("error" in publicationResult) {
        return {
          error: "Generic error",
          errorDetails: publicationResult.error,
        };
      }
      try {
        unlinkSync(await getSvgPath(false, issuecode));
      } catch (errorDetails) {
        if ((errorDetails as { code?: string }).code === "ENOENT") {
          console.log("No temporary SVG file to delete was found");
        } else {
          return {
            error: "Generic error",
            errorDetails: errorDetails as string,
          };
        }
      }

      return { results: { paths, isNew: publicationResult.isNew } };
    } else {
      if (runSubmit) {
        await getEdgeCreatorServices(token).submitEdge(issuecode);
      }
      return { results: { paths, isNew: false } };
    }
  },
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
