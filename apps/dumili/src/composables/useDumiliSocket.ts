import CoverIdEvents from "~dm-services/cover-id/types";
import CloudinaryIndexationsEvents, {
  IndexationEvents,
} from "~dumili-services/cloudinary-indexations/types";
import { useSocket } from "~socket.io-client-services";

const socketWrapper = useSocket(import.meta.env.VITE_DUMILI_SOCKET_URL);

export const coverIdServices = socketWrapper.addNamespace<CoverIdEvents>(
  CoverIdEvents.namespaceEndpoint
);

export const cloudinaryIndexationsServices =
  socketWrapper.addNamespace<CloudinaryIndexationsEvents>(
    CloudinaryIndexationsEvents.namespaceEndpoint
  );

export const getIndexationSocket = (indexationId: string) =>
  socketWrapper.addNamespace<IndexationEvents>(
    `${CloudinaryIndexationsEvents.namespaceEndpoint}/${indexationId}`
  );
