import type { Namespace, Server } from "socket.io";

import edgePublication from "./edge-publication";
import edgeSprites from "./edge-sprites";
import multipleEdgePhotos from "./multiple-edge-photos";
import type Events from "./types";
import { namespaceEndpoint } from "./types";
import { RequiredAuthMiddleware, UserIsAdminMiddleware } from "../auth/util";
export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>)
    .use(RequiredAuthMiddleware)
    .use(UserIsAdminMiddleware)
    .on("connection", (socket) => {
      console.log("connected to edgecreator as editor");

      edgeSprites(socket);
      edgePublication(socket);
      multipleEdgePhotos(socket);
    });
};
