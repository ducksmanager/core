import { useSocketEvents } from "socket-call-server";

import type { UserServices } from "../../index";
import { RequiredAuthMiddleware } from "../auth/util";
import namespaces from "../namespaces";
import suggestions from "./suggestions";
import watchedAuthors from "./watchedAuthors";

const listenEvents = (services: UserServices) => ({
  ...suggestions(services),
  ...watchedAuthors(services),
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.STATS, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
