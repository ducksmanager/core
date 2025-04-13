import { execSync } from "child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import type { Socket } from "socket.io";
import { SocketClient } from "socket-call-client";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { type ClientEvents as EdgeCreatorEvents } from "~dm-services/edgecreator";
import namespaces from "~dm-services/namespaces";
import type { ExportPaths } from "~types/ExportPaths";
import type { ModelContributor } from "~types/ModelContributor";

import { getSvgPath } from "../../_utils";

export type SaveServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object, { token: string }>,
  Record<string, never>
>;

const getEdgeCreatorServices = (token: string) => {
  const dmSocket = new SocketClient(process.env.DM_SOCKET_URL!);
  dmSocket.onConnectError = (e) => console.error(e);
  return dmSocket.addNamespace<EdgeCreatorEvents>(namespaces.EDGECREATOR, {
    session: {
      getToken: async () => token,
      sessionExists: () => Promise.resolve(!!token),
      clearSession: () => {
        console.log("not allowed");
      },
    },
  });
};

const listenEvents = (services: SaveServices) => ({
  saveEdge: async (parameters: {
    runExport: boolean;
    runSubmit: boolean;
    issuecode: string;
    contributors: ModelContributor[];
    content: string;
  }) => {
    const { token } = services._socket.handshake.auth;
    const { runExport, runSubmit, issuecode, contributors, content } =
      parameters;
    const svgPath = await getSvgPath(runExport, issuecode);

    mkdirSync(path.dirname(svgPath), { recursive: true });
    writeFileSync(svgPath, content);
    let paths: ExportPaths = { svgPath };
    if (runExport) {
      const pngPath = svgPath.replace(".svg", ".png");

      execSync(`convert "${svgPath}" "${pngPath}"`);

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

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>("/save", {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
