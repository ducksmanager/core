import { Namespace,Server } from "socket.io";

import edgePublication from "./edge-publication";
import edgeSprites from "./edge-sprites";
import multipleEdgePhotos from "./multiple-edge-photos";
import Services from "./types";

export default (io: Server) => {
  (io.of(Services.namespaceEndpoint) as Namespace<Services>).on(
    "connection",
    (socket) => {
      edgeSprites(socket);
      edgePublication(socket);
      multipleEdgePhotos(socket);
    }
  );
};
