import { Server } from "socket.io";

import edgePublication from "./edge-publication";
import edgeSprites from "./edge-sprites";
import multipleEdgePhotos from "./multiple-edge-photos";
import { Namespace } from "./types";

export default (io: Server) => {
  (io.of(Namespace['endpoint']) as Namespace).on("connection", (socket) => {
    edgeSprites(socket);
    edgePublication(socket);
    multipleEdgePhotos(socket);
  })
};
