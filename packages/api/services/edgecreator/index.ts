import { Namespace,Server } from "socket.io";

import edgePublication from "./edge-publication";
import edgeSprites from "./edge-sprites";
import multipleEdgePhotos from "./multiple-edge-photos";
import Services from "./types";

export default (io: Server) => {
  (io.of(Services.namespaceEndpoint) as Namespace<Services>).on(
    "connection",
    (socket) => {
      console.log("connected to edgecreator");

      edgeSprites(socket);
      edgePublication(socket);
      multipleEdgePhotos(socket);
    }
  );
};
