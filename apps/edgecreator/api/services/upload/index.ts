import type { Namespace, Server } from "socket.io";
import { decode } from "node-base64-image";

import type Events from "./types";
import { namespaceEndpoint } from "./types";
import { getNextAvailableFile } from "../_upload_utils";

const edgesPath: string = process.env.EDGES_PATH!;

const dmApi = createAxios(process.env.VITE_DM_API_URL!);

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to upload");

    socket.on("uploadFromBase64", async (parameters, callback) => {
      const { country, issuenumber, magazine, data } = parameters;
      const path = `${edgesPath}/${country}/photos`;
      const tentativeFileName = `${magazine}.${issuenumber}.photo`;
      const fileName = getNextAvailableFile(
        `${path}/${tentativeFileName}`,
        "jpg"
      ).match(/\/([^/]+)$/)![1];

      await decode(data, {
        fname: `${path}/${fileName.replace(/.jpg$/, "")}`,
        ext: "jpg",
      });

      try {
        await call(
          dmApi,
          new PUT__edgecreator__multiple_edge_photo__v2({
            reqBody: {
              publicationcode: `${country}/${magazine}`,
              issuenumber,
            },
          })
        );
      } catch (e) {
        callback({ error: "Generic error", errorDetails: e as string });
      }

      callback({ fileName });
    });
  });
};
