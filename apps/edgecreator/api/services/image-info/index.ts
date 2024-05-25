import axios from "axios";
import sizeOf from "image-size";
import type { Namespace, Server } from "socket.io";

import type Events from "./types";
import { namespaceEndpoint } from "./types";
export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to text");

    socket.on("getImageInfo", async (targetUrl, callback) => {
      const url = targetUrl.startsWith("https://res.cloudinary.com")
        ? targetUrl
        : `${process.env.EDGES_URL!}/${targetUrl}`;

      const response = await axios.get<string>(url);
      if (response.status === 200) {
        try {
          const buffer = Buffer.from(response.data);
          const dimensions = sizeOf(buffer) as {
            width: number;
            height: number;
          };
          const base64 = `data:${
            response.headers["Content-Type"]
          };base64,${buffer.toString()}`;
          callback({ results: { dimensions, base64, url } });
        } catch (e) {
          callback({
            error: "Cloudinary error",
            errorDetails: `${targetUrl} : ${e as string}`,
          });
        }
      }
    });
  });
};
