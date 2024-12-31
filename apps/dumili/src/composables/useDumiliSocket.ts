import type {
  IndexationServerSentStartEndEvents,
  Events as IndexationEvents,
} from "~dumili-services/indexation";
import { namespaceEndpoint as indexationEndpoint } from "~dumili-services/indexation/types";
import { client as indexationsServices } from "~dumili-services/indexations";
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
    socket.addNamespace<IndexationEvents, IndexationServerSentStartEndEvents>(
      indexationEndpoint.replace("{id}", id),
      { session },
    );

  const indexationSocket = ref<
    ReturnType<typeof getIndexationSocketFromId> | undefined
  >(undefined);

  return {
    options,
    indexations: socket.addNamespace<
      (typeof indexationsServices)["emitEvents"]
    >(indexationsServices.namespaceEndpoint, {
      session,
    }),
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
