import { useSocketEvents } from "socket-call-server";

import namespaces from "../namespaces";
import { getIssuesFromUsername } from "../collection/issues";

const listenEvents = () => ({
  getPublicCollection: async (username: string) => getIssuesFromUsername(username)
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.PUBLIC_COLLECTION,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
