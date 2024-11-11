import { existsSync, readFileSync } from "fs";
import type { Namespace, Server } from "socket.io";

import type Events from "./types";
import type { AppInfos, ErrorableAppUpdate } from "./types";
import { namespaceEndpoint } from "./types";

export const getUpdateFileUrl = (appInfos?: AppInfos): ErrorableAppUpdate => {
  const fileName = import.meta.dirname + "/latest-whattheduck-bundle.txt";
  if (existsSync(fileName)) {
    const mostRecentBundleUrl = readFileSync(fileName).toString();

    const version = mostRecentBundleUrl.match(/(?<=bundle-).+(?=.zip)/)![0];

    if (
      appInfos &&
      (appInfos.version === "builtin" || appInfos.version < version)
    ) {
      return {
        version,
        url: mostRecentBundleUrl,
      };
    } else {
      return { error: "Already up to date" };
    }
  } else {
    return { error: "Not found", errorDetails: fileName };
  }
};

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to app");

    socket.on("getBundleUrl", (appInfos, callback) => {
      callback(getUpdateFileUrl(appInfos));
    });
  });
};
