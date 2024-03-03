import CoverIdEvents from "~dm-services/cover-id/types";
import IndexationsEvents, {
  IndexationEvents,
} from "~dumili-services/indexations/types";
import { useSocket } from "~socket.io-client-services";

const socketWrapper = useSocket(import.meta.env.VITE_DUMILI_SOCKET_URL);

export const coverIdServices = socketWrapper.addNamespace<CoverIdEvents>(
  CoverIdEvents.namespaceEndpoint,
);

export const indexationsEvents = socketWrapper.addNamespace<IndexationsEvents>(
  IndexationsEvents.namespaceEndpoint,
);

export const getIndexationSocket = (indexationId: string) =>
  socketWrapper.addNamespace<IndexationEvents>(
    `${IndexationsEvents.namespaceEndpoint}/${indexationId}`,
  );
