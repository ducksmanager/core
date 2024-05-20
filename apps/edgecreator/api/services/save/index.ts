import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import type { Namespace } from "socket.io";
import type { Server } from "socket.io";

import { getSvgPath } from "~/_utils";
import EdgeCreatorServices from "~dm-services/edgecreator/types";
import { useSocket } from "~socket.io-client-services";
import type { ExportPaths } from "~types/ExportPaths";

import type Events from "./types";
import { namespaceEndpoint } from "./types";
import { exec } from "child_process";

const socket = useSocket(process.env.DM_SOCKET_URL!);
const { services: edgeCreatorServices } =
  socket.addNamespace<EdgeCreatorServices>(
    EdgeCreatorServices.namespaceEndpoint
  );
export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to save");

    socket.on("saveEdge", async (parameters, callback) => {
      const {
        runExport,
        runSubmit,
        country,
        magazine,
        issuenumber,
        contributors,
        content,
      } = parameters;
      const svgPath = getSvgPath(runExport, country, magazine, issuenumber);

      const publicationcode = `${country}/${magazine}`;

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

        const publicationResult = await edgeCreatorServices.publishEdge({
          publicationcode,
          issuenumber,
          designers,
          photographers,
        });
        if (publicationResult.error) {
          callback({
            error: "Generic error",
            errorDetails: publicationResult.errorDetails as string,
          });
          return;
        }
        try {
          unlinkSync(getSvgPath(false, country, magazine, issuenumber));
        } catch (errorDetails) {
          if ((errorDetails as { code?: string }).code === "ENOENT") {
            console.log("No temporary SVG file to delete was found");
          } else {
            callback({
              error: "Generic error",
              errorDetails: errorDetails as string,
            });
          }
        }

        callback({ results: { paths, isNew: publicationResult.isNew } });
      } else {
        if (runSubmit) {
          await edgeCreatorServices.submitEdge(publicationcode, issuenumber);
        }
        callback({ results: { paths, isNew: false } });
      }
    });
  });
};
