import { existsSync, readFileSync } from "fs";
import { useSocketEvents } from "socket-call-server";

import namespaces from "../namespaces";

type AppInfos = {
  version: string;
};

export const getUpdateFileUrl = async (
  appInfos?: AppInfos,
) => {
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
      return { error: "Already up to date" } as const;
    }
  } else {
    return { error: "Not found", errorDetails: fileName } as const;
  }
};

const listenEvents = () => ({
  getBundleUrl: (appInfos: AppInfos) => getUpdateFileUrl(appInfos),
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.APP,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
