<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import { buildWebStorage, SocketClient } from "socket-call-client";
import { stores as webStores, composables } from "~web";
const { useDmSocket } = composables;
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";
import { duckguessrSocketInjectionKey } from "~/composables/useDuckguessrSocket";
import Cookies from "js-cookie";

// Import the socket types directly
import { type ClientEmitEvents as DatasetsEmitEvents } from "~duckguessr-services/datasets";
import {
  type ClientEmitEvents as GameEmitEvents,
  type ClientListenEvents as GameListenEvents,
} from "~duckguessr-services/game";
import { type ClientEmitEvents as MaintenanceEmitEvents } from "~duckguessr-services/maintenance";
import { type ClientEmitEvents as MatchEmitEvents } from "~duckguessr-services/match";
import namespaces from "~duckguessr-services/namespaces";
import {
  type ClientEmitEvents as PlayerEmitEvents,
  type ClientListenEvents as PlayerListenEvents,
} from "~duckguessr-services/player";
import { type ClientEmitEvents as PodiumEmitEvents } from "~duckguessr-services/podium";

const onConnectError = (e: Error) => {
  const error = String(e);
  console.error(error);
  if (
    error.indexOf("No token provided") !== -1 ||
    error.indexOf("jwt expired") !== -1
  ) {
    location.replace(
      `${import.meta.env.VITE_DM_URL}/login?redirect=${window.location.href}`,
    );
  }
};

const session: Parameters<typeof useDmSocket>[0]["session"] = {
  getToken: () => Promise.resolve(Cookies.get("token")),
  clearSession: () => Promise.resolve(Cookies.remove("token")),
  sessionExists: () =>
    Promise.resolve(typeof Cookies.get("token") === "string"),
};

const dmSocketClient = new SocketClient(
  import.meta.env.VITE_DM_SOCKET_URL || "http://localhost:3001",
);
const storySearchSocketClient = new SocketClient(
  "http://localhost:3001", // Default for story search socket
);

getCurrentInstance()!.appContext.app.provide("dmSocket", dmSocketClient);
getCurrentInstance()!.appContext.app.provide(
  "storySearchSocket",
  storySearchSocketClient,
);

const dmSocket = useDmSocket({
  cacheStorage: import.meta.client
    ? buildWebStorage(sessionStorage)
    : undefined,
  session,
  onConnectError,
});

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

let duckguessrSocketClient;
try {
  duckguessrSocketClient = new SocketClient(socketUrl);
} catch (error) {
  console.error("Error creating SocketClient:", error);
  throw error;
}

const getGameSocketFromId = (id: number) =>
  duckguessrSocketClient.addNamespace<GameEmitEvents, GameListenEvents>(
    namespaces.GAME.replace("{id}", id.toString()),
    {
      session,
    },
  );

let playerSocket;
try {
  playerSocket = duckguessrSocketClient.addNamespace<
    PlayerEmitEvents,
    PlayerListenEvents
  >(namespaces.PLAYER, {
    session,
    onConnectError,
  });
} catch (error) {
  console.error("Error creating player socket:", error);
  throw error;
}

const maintenanceSocket =
  duckguessrSocketClient.addNamespace<MaintenanceEmitEvents>(
    namespaces.MAINTENANCE,
    {
      session,
      onConnectError,
    },
  );

const datasetsSocket = duckguessrSocketClient.addNamespace<DatasetsEmitEvents>(
  namespaces.DATASETS,
  {
    session,
  },
);

const podiumSocket = duckguessrSocketClient.addNamespace<PodiumEmitEvents>(
  namespaces.PODIUM,
  {
    session,
  },
);

const duckguessrSocket = {
  options: { session, onConnectError },
  playerSocket,
  maintenanceSocket,
  datasetsSocket,
  podiumSocket,
  createMatchmakingSocket: () =>
    duckguessrSocketClient.addNamespace<MatchEmitEvents>(namespaces.MATCH, {
      session,
    }),
  getGameSocketFromId,
};

getCurrentInstance()!.appContext.app.provide(dmSocketInjectionKey, dmSocket);
getCurrentInstance()!.appContext.app.provide(
  duckguessrSocketInjectionKey,
  duckguessrSocket,
);

onMounted(() => {
  webStores.collection().loadUser();
});
</script>
