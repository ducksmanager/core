import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import namespaces from "../namespaces";

type StatusServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, object, object>,
  Record<string, never>
>;

const listenEvents = ({ _socket }: StatusServices) => ({});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.STATUS, {
  listenEvents,
  middlewares: [],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
