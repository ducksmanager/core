import CoaEvents from "~dm-services/coa/types";
import CoverIdEvents from "~dm-services/cover-id/types";
import IndexationsEvents, {
  IndexationEvents,
} from "~dumili-services/indexations/types";
import { useSocket } from "~socket.io-client-services";

const defaultExport = (options: {
  onConnectError: (e: any, namespace: string) => Promise<void> | void;
  session: {
    getToken: () => Promise<string | null | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const { addNamespace } = inject("socket") as ReturnType<typeof useSocket>;

  return {
    options,
    coverId: addNamespace<CoverIdEvents>(CoverIdEvents.namespaceEndpoint),
    coa: addNamespace<CoaEvents>(CoaEvents.namespaceEndpoint),
    indexations: addNamespace<IndexationsEvents>(
      IndexationsEvents.namespaceEndpoint
    ),
    getIndexationSocket: (indexationId: string) =>
      addNamespace<IndexationEvents>(
        `${IndexationsEvents.namespaceEndpoint}/${indexationId}`
      ),
  };
};

export default defaultExport;

export const dumiliSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
