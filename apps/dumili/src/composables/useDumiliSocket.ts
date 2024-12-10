import type { ServerSentEvents } from "~dumili-services/indexation/types";
import IndexationServices from "~dumili-services/indexation/types";
import IndexationsServices from "~dumili-services/indexations/types";
import type { SocketClient } from "~socket.io-client-services";

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
    socket.addNamespace<IndexationServices, ServerSentEvents>(
      IndexationServices.namespaceEndpoint.replace("{id}", id),
      { session },
    );

  const indexationSocket = ref<
    ReturnType<typeof getIndexationSocketFromId> | undefined
  >(undefined);

  return {
    options,
    indexations: socket.addNamespace<IndexationsServices>(
      IndexationsServices.namespaceEndpoint,
      { session },
    ),
    indexationSocket,
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
