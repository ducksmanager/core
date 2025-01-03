import { existsSync, readFileSync } from "fs";

import type { Errorable } from "~socket.io-services";
import { useSocketServices } from "~socket.io-services";

import namespaces from "../namespaces";

type AppInfos = {
  version: string;
};

type ErrorableAppUpdate = Errorable<
  {
    version: string;
    url: string;
  },
  "Not found" | "Already up to date"
>;

export const getUpdateFileUrl = (appInfos?: AppInfos): ErrorableAppUpdate => {
  const fileName = import.meta.dirname + "/latest-whattheduck-bundle.txt";
  if (existsSync(fileName)) {
    const mostRecentBundleUrl = readFileSync(fileName).toString().trim();

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

const listenEvents = () => ({
  getBundleUrl: (appInfos: AppInfos) => getUpdateFileUrl(appInfos),
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents
>(namespaces.APP, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
