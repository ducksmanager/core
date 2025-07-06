import type { SocketClient } from "socket-call-client";

import { type ClientEmitEvents as DatasetsEmitEvents } from "~duckguessr-services/datasets";
import { type ClientEmitEvents as GameEmitEvents } from "~duckguessr-services/game";
import { type ClientEmitEvents as MaintenanceEmitEvents } from "~duckguessr-services/maintenance";
import { type ClientEmitEvents as MatchEmitEvents } from "~duckguessr-services/match";
import namespaces from "~duckguessr-services/namespaces";
import {
  type ClientEmitEvents as PlayerEmitEvents,
  // type ClientListenEvents as PlayerListenEvents,
} from "~duckguessr-services/player";
import { type ClientEmitEvents as PodiumEmitEvents } from "~duckguessr-services/podium";

const defaultExport = (options: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectError: (e: any, namespace: string) => Promise<void> | void;
  session: {
    getToken: () => Promise<string | null | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const socket = inject("duckguessrSocket") as SocketClient;

  const { session } = options;

  const getGameSocketFromId = (id: number) =>
    socket.addNamespace<GameEmitEvents>(
      namespaces.GAME.replace("{id}", id.toString()),
      {
        session,
      },
    );

  const playerSocket = ref(
    socket.addNamespace<PlayerEmitEvents>(namespaces.PLAYER, {
      session,
    }),
  );
  const gameSocket = ref<ReturnType<typeof getGameSocketFromId>>();

  const maintenanceSocket = ref(
    socket.addNamespace<MaintenanceEmitEvents>(namespaces.MAINTENANCE, {
      session,
    }),
  );

  const datasetsSocket = ref(
    socket.addNamespace<DatasetsEmitEvents>(namespaces.DATASETS, {
      session,
    }),
  );

  const podiumSocket = ref(
    socket.addNamespace<PodiumEmitEvents>(namespaces.PODIUM, {
      session,
    }),
  );

  return {
    options,
    gameSocket,
    playerSocket,
    maintenanceSocket,
    datasetsSocket,
    podiumSocket,
    createMatchmakingSocket: (cookies) =>
      socket.addNamespace<MatchEmitEvents>(namespaces.MATCH, {
        session,
      }),
    getGameSocketFromId,
    setGameSocketFromId: (id: number) => {
      gameSocket.value = getGameSocketFromId(id);
    },
  };
};

export default defaultExport;

export const duckguessrSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
