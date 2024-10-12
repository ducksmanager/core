import IndexationServices from "~dumili-services/indexation/types";
import IndexationsServices from "~dumili-services/indexations/types";
import { SocketClient } from "~socket.io-client-services";

const defaultExport = (options: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectError: (e: any, namespace: string) => Promise<void> | void;
  session: {
    getToken: () => Promise<string | null | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const socket = inject("dmSocket") as SocketClient;

  const getIndexationSocketFromId = (id: string) =>
    socket.addNamespace<IndexationServices>(
      IndexationServices.namespaceEndpoint.replace("{id}", id),
    );

  const indexationSocket = ref<
    ReturnType<typeof getIndexationSocketFromId> | undefined
  >(undefined);

  return {
    options,
    indexations: socket.addNamespace<IndexationsServices>(
      IndexationsServices.namespaceEndpoint,
    ),
    indexationSocket,
    setIndexationSocketFromId: (id: string) => {
      indexationSocket.value = getIndexationSocketFromId(id);
    },
  };
};

export default defaultExport;

export const dumiliSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
