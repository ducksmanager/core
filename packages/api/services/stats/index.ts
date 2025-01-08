import type { SessionUser } from "~dm-types/SessionUser";
import { useSocketEvents } from "socket-call-server";

import type { UserSocket } from "../../index";
import namespaces from "../namespaces";
import suggestions from "./suggestions";
import watchedAuthors from "./watchedAuthors";

const listenEvents = (socket: UserSocket) => ({
  ...suggestions(socket),
  ...watchedAuthors(socket),
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>,
  Record<string, never>,
  { user: SessionUser }
>(namespaces.STATS, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
