import { useSocketEvents } from "socket-call-server";

import { getIssuesFromUsername } from "../collection/issues";
import namespaces from "../namespaces";

const listenEvents = () => ({
  getPublicCollection: async (username: string) =>
    getIssuesFromUsername(username),
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.PUBLIC_COLLECTION,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
