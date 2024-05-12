import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import type { Namespace, Server } from "socket.io";

import { getSvgPath } from "~/_utils";
import type { ExportPaths } from "~types/ExportPaths";

import type Events from "./types";
import { namespaceEndpoint } from "./types";
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
        try {
          await sharp(svgPath).png().toFile(pngPath);
        } catch (errorDetails) {
          callback({
            error: "Generic error",
            errorDetails: errorDetails as string,
          });
        }

        paths = { ...paths, pngPath };

        const designers = contributors
          .filter(({ contributionType }) => contributionType === "createur")
          .map(({ user }) => user.username);

        const photographers = contributors
          .filter(({ contributionType }) => contributionType === "photographe")
          .map(({ user }) => user.username);

        try {
          const { isNew } = (
            await call(
              dmApi,
              new PUT__edgecreator__publish__$country__$magazine__$issuenumber({
                params: { country, magazine, issuenumber },
                reqBody: {
                  designers,
                  photographers,
                },
              }),
            )
          ).data;
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

          callback({ results: { paths, isNew } });
        } catch (errorDetails) {
          callback({
            error: "Generic error",
            errorDetails: errorDetails as string,
          });
        }
      } else {
        if (runSubmit) {
          try {
            await call(
              dmApi,
              new PUT__edgecreator__submit({
                reqBody: {
                  publicationcode,
                  issuenumber,
                },
              }),
            );
          } catch (errorDetails) {
            callback({
              error: "Generic error",
              errorDetails: errorDetails as string,
            });
          }
        }
        callback({ results: { paths, isNew: false } });
      }
    });
  });
};
