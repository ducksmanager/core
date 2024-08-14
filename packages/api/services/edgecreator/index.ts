import type { Namespace, Server } from "socket.io";

import edgeModelReady from "~/emails/edge-model-ready";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { RequiredAuthMiddleware } from "../auth/util";
import edgePublication from "./edge-publication";
import edgeSprites from "./edge-sprites";
import models from "./models";
import multipleEdgePhotos from "./multiple-edge-photos";
import type Events from "./types";
import { namespaceEndpoint } from "./types";
export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>)
    .use(RequiredAuthMiddleware)
    // .use(UserIsAdminMiddleware)
    .on("connection", (socket) => {
      console.log("connected to edgecreator as editor");

      socket.on("submitEdge", async (issuecode, callback) => {
        const user = await prismaDm.user.findUniqueOrThrow({
          where: {
            id: socket.data.user!.id,
          },
        });

        const email = new edgeModelReady({
          user,
          issuecode,
        });
        await email.send();

        callback({ url: email.data.ecLink });
      });

      models(socket);
      edgeSprites(socket);
      edgePublication(socket);
      multipleEdgePhotos(socket);
    });
};
