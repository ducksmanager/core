import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";
import type { SessionUser } from "../types/SessionUser";

// import { createGameSocket } from "./game";
import game from "../game";
import namespaces from "./namespaces";

export type MatchServices = NamespaceProxyTarget<
  Socket<
    typeof listenEvents,
    Record<string, never>,
    Record<string, never>,
    { user: SessionUser }
  >,
  Record<string, never>
>;

const listenEvents = ({ _socket }: MatchServices) => ({
  createMatch: async (dataset: string) => {
    console.log(`${_socket.data.user.username} is creating a match`);
    const newGame = (await game.create(dataset))!;
    // await createGameSocket(_socket, newGame.id);
    return newGame.id;
  },
});

const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.MATCH, {
  listenEvents,
  middlewares: [],
});

export { client, server };
export type ClientEmitEvents = (typeof client)["emitEvents"];
