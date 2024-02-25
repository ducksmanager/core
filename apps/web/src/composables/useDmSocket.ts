import dayjs from "dayjs";

import AuthServices from "~dm-services/auth/types";
import BookcaseServices from "~dm-services/bookcase/types";
import BookstoreServices from "~dm-services/bookstores/types";
import CoaServices from "~dm-services/coa/types";
import CollectionServices from "~dm-services/collection/types";
import CoverIdServices from "~dm-services/cover-id/types";
import EdgeCreatorServices from "~dm-services/edgecreator/types";
import EdgesServices from "~dm-services/edges/types";
import EventsServices from "~dm-services/events/types";
import GlobalStatsServices from "~dm-services/global-stats/types";
import LoginServices from "~dm-services/login/types";
import PresentationTextServices from "~dm-services/presentation-text/types";
import PublicCollectionServices from "~dm-services/public-collection/types";
import StatsServices from "~dm-services/stats/types";
import { useSocket } from "~socket.io-client-services";

// const oneHour = () => dayjs().add(1, "hour").diff(dayjs());
const until4am = () => {
  const now = dayjs();
  let coaCacheExpiration = dayjs();
  if (now.get("hour") >= 4) {
    coaCacheExpiration = coaCacheExpiration.add(1, "day");
  }
  return coaCacheExpiration
    .set("hour", 4)
    .set("minute", 0)
    .set("second", 0)
    .set("millisecond", 0)
    .diff(now);
};

const socket = useSocket(import.meta.env.VITE_DM_SOCKET_URL);

export const publicCollectionServices =
  socket.addNamespace<PublicCollectionServices>(
    PublicCollectionServices.namespaceEndpoint,
  );
export const loginServices = socket.addNamespace<LoginServices>(
  LoginServices.namespaceEndpoint,
);

export const bookcaseServices = socket.addNamespace<BookcaseServices>(
  BookcaseServices.namespaceEndpoint,
);
export const statsServices = socket.addNamespace<StatsServices>(
  StatsServices.namespaceEndpoint,
);

export const authServices = socket.addNamespace<AuthServices>(
  AuthServices.namespaceEndpoint,
);
export const edgeCreatorServices = socket.addNamespace<EdgeCreatorServices>(
  EdgeCreatorServices.namespaceEndpoint,
);

export const presentationTextServices =
  socket.addNamespace<PresentationTextServices>(
    PresentationTextServices.namespaceEndpoint,
  );
export const edgesServices = socket.addNamespace<EdgesServices>(
  EdgesServices.namespaceEndpoint,
);

export const coaServices = socket.addNamespace<CoaServices>(
  CoaServices.namespaceEndpoint,
  {
    ttl: until4am(),
  },
);
export const globalStatsServices = socket.addNamespace<GlobalStatsServices>(
  GlobalStatsServices.namespaceEndpoint,
  // {
  //   ttl: oneHour(),
  // },
);
export const eventsServices = socket.addNamespace<EventsServices>(
  EventsServices.namespaceEndpoint,
);
export const bookstoreServices = socket.addNamespace<BookstoreServices>(
  BookstoreServices.namespaceEndpoint,
);
export const collectionServices = socket.addNamespace<CollectionServices>(
  CollectionServices.namespaceEndpoint,
);
export const coverIdServices = socket.addNamespace<CoverIdServices>(
  CoverIdServices.namespaceEndpoint,
);
