import type { SessionUser } from "~dm-types/SessionUser";
import { useSocketServices } from "~socket.io-services";

import type { UserSocket } from "../../index";
import namespaces from "../namespaces";
import suggestions from "./suggestions";
import watchedAuthors from "./watchedAuthors";

const listenEvents = (socket: UserSocket) => ({
  ...suggestions(socket),
  ...watchedAuthors(socket),
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { user: SessionUser }
>(namespaces.STATS, {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
