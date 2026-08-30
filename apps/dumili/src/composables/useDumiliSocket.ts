import type { SocketClient } from "socket-call-client";

import {
  type ClientEmitEvents as IndexationEmitEvents,
  type ClientListenEvents as IndexationListenEvents,
} from "~dumili-services/indexation";
import { type ClientEmitEvents as IndexationCreationEmitEvents } from "~dumili-services/indexation-creation";
import { type ClientEmitEvents as IndexationsEmitEvents } from "~dumili-services/indexations";
import { type ClientEmitEvents as StatusEmitEvents } from "~dumili-services/status";
import namespaces from "~dumili-services/namespaces";

const defaultExport = (options: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectError: (e: any, namespace: string) => Promise<void> | void;
  session: {
    getToken: () => Promise<string | null | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const socket = inject("dumiliSocket") as SocketClient;

  const { session } = options;

  const getIndexationSocketFromId = (id: string) =>
    socket.addNamespace<IndexationEmitEvents, IndexationListenEvents>(
      namespaces.INDEXATION.replace("{id}", id),
    );

  const statusSocket = ref(
    socket.addNamespace<StatusEmitEvents>(namespaces.STATUS, {
      session,
    }),
  );

  const indexationsSocket = ref(
    socket.addNamespace<IndexationsEmitEvents>(namespaces.INDEXATIONS, {
      session,
    }),
  );

  const indexationCreationSocket = ref(
    socket.addNamespace<IndexationCreationEmitEvents>(
      namespaces.INDEXATION_CREATION,
      {
        session,
      },
    ),
  );

  const indexationSocket = ref<ReturnType<typeof getIndexationSocketFromId>>();

  return {
    options,
    indexationsSocket,
    indexationCreationSocket,
    indexationSocket,
    statusSocket,
    getIndexationSocketFromId,
    setIndexationSocketFromId: (id: string) => {
      indexationSocket.value = getIndexationSocketFromId(id);
    },
  };
};

export default defaultExport;

export const dumiliSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
