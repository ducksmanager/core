import { useSocketEvents } from "socket-call-server";

import type { SessionUser } from "~dm-types/SessionUser";

import type { UserServices } from "../../index";
import namespaces from "../namespaces";
import suggestions from "./suggestions";
import watchedAuthors from "./watchedAuthors";

const listenEvents = (services: UserServices) => ({
  ...suggestions(services),
  ...watchedAuthors(services)
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
