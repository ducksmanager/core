import CoverIdEvents from "~dm-services/cover-id/types";
import CloudinaryIndexationsEvents, {
  IndexationEvents,
} from "~dumili-services/cloudinary-indexations/types";
import { useSocket } from "~socket.io-client-services";

export const cloudinaryIndexationsServices =
  useSocket<CloudinaryIndexationsEvents>(
    CloudinaryIndexationsEvents.namespaceEndpoint
  );

export const getIndexationSocket = (indexationId: string) =>
  useSocket<IndexationEvents>(
    `${CloudinaryIndexationsEvents.namespaceEndpoint}/${indexationId}`
  );

export const coverIdServices = useSocket<CoverIdEvents>(
  CoverIdEvents.namespaceEndpoint
);
