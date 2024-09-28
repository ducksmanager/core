import type { Namespace, Server } from "socket.io";

import type Events from "./types";
import { namespaceEndpoint, AppInfos } from "./types";

export const getAppUpdates = (requestBody: string) => {
  const body = JSON.parse(requestBody || "{}") as AppInfos;
  console.log("update asked!", requestBody);

  // if (body.version_name === "1.0.0") {
  //   return {
  //     version: "1.0.1",
  //     url: "https://apiurl.com/mybuild_101.zip",
  //   };
  // } else {
  return {
    message: "Error version not found",
    version: "",
    url: "",
  };
  // }
};

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to app");

    socket.on("getUpdate", (data, callback) => {
      console.log("update asked!", data);

      callback({
        version: "1.0.1",
        url: "https://apiurl.com/mybuild_101.zip",
      });
    });
  });
};
