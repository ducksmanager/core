import type { Namespace,Server } from "socket.io";

import edgePublication from "./edge-publication";
import edgeSprites from "./edge-sprites";
import multipleEdgePhotos from "./multiple-edge-photos";
import Events from "./types";
export default (io: Server) => {
  (io.of(Events.namespaceEndpoint) as Namespace<Events>).on(
    "connection",
    (socket) => {
      console.log("connected to edgecreator");

      edgeSprites(socket);
      edgePublication(socket);
      multipleEdgePhotos(socket);
    }
  );
};
