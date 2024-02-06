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

export const publicCollectionServices = useSocket<PublicCollectionServices>(
  PublicCollectionServices.namespaceEndpoint,
);
export const loginServices = useSocket<LoginServices>(
  LoginServices.namespaceEndpoint,
);

export const bookcaseServices = useSocket<BookcaseServices>(
  BookcaseServices.namespaceEndpoint,
);
export const statsServices = useSocket<StatsServices>(
  StatsServices.namespaceEndpoint,
);

export const authServices = useSocket<AuthServices>(
  AuthServices.namespaceEndpoint,
);
export const edgeCreatorServices = useSocket<EdgeCreatorServices>(
  EdgeCreatorServices.namespaceEndpoint,
);

export const presentationTextServices = useSocket<PresentationTextServices>(
  PresentationTextServices.namespaceEndpoint,
);
export const edgesServices = useSocket<EdgesServices>(
  EdgesServices.namespaceEndpoint,
);

export const coaServices = useSocket<CoaServices>(
  CoaServices.namespaceEndpoint,
  {
    ttl: until4am(),
  },
);
export const globalStatsServices = useSocket<GlobalStatsServices>(
  GlobalStatsServices.namespaceEndpoint,
  // {
  //   ttl: oneHour(),
  // },
);
export const eventsServices = useSocket<EventsServices>(
  EventsServices.namespaceEndpoint,
);
export const bookstoreServices = useSocket<BookstoreServices>(
  BookstoreServices.namespaceEndpoint,
);
export const collectionServices = useSocket<CollectionServices>(
  CollectionServices.namespaceEndpoint,
);
export const coverIdServices = useSocket<CoverIdServices>(
  CoverIdServices.namespaceEndpoint,
);
