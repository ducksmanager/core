import suggestions from "./suggestions";
import watchedAuthors from "./watchedAuthors";
import { useSocketServices } from "~socket.io-services";
import type { SessionUser } from "~dm-types/SessionUser";
import { UserSocket } from "~/index";

const listenEvents = (socket: UserSocket) => ({
  ...suggestions(socket),
  ...watchedAuthors(socket),
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { user: SessionUser }
>("/coa", {
  listenEvents,
  middlewares: [],
});

export type ClientEvents = (typeof client)["emitEvents"];
