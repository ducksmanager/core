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
import type { AxiosStorage } from "~socket.io-client-services";
import { useSocket } from "~socket.io-client-services";

export default (options: {
  cacheStorage: AxiosStorage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectError: (e: any, namespace: string) => Promise<void> | void;
  session: {
    getToken: () => Promise<string | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const { session, onConnectError } = options;
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

  const { addNamespace } = inject("socket") as ReturnType<typeof useSocket>;

  return {
    options,
    publicCollectionServices: addNamespace<PublicCollectionServices>(
      PublicCollectionServices.namespaceEndpoint,
      { onConnectError },
    ),
    loginServices: addNamespace<LoginServices>(
      LoginServices.namespaceEndpoint,
      { onConnectError },
    ),

    bookcaseServices: addNamespace<BookcaseServices>(
      BookcaseServices.namespaceEndpoint,
      { onConnectError, session },
    ),
    statsServices: addNamespace<StatsServices>(
      StatsServices.namespaceEndpoint,
      { onConnectError, session },
    ),
    authServices: addNamespace<AuthServices>(AuthServices.namespaceEndpoint, {
      onConnectError,
      session,
    }),
    edgeCreatorServices: addNamespace<EdgeCreatorServices>(
      EdgeCreatorServices.namespaceEndpoint,
      { onConnectError },
    ),
    presentationTextServices: addNamespace<PresentationTextServices>(
      PresentationTextServices.namespaceEndpoint,
      { onConnectError },
    ),
    edgesServices: addNamespace<EdgesServices>(
      EdgesServices.namespaceEndpoint,
      { onConnectError },
    ),
    coaServices: addNamespace<CoaServices>(CoaServices.namespaceEndpoint, {
      onConnectError,
      cache: {
        ttl: until4am(),
      },
    }),
    globalStatsServices: addNamespace<GlobalStatsServices>(
      GlobalStatsServices.namespaceEndpoint,
      { onConnectError },
      // {
      //   ttl: oneHour(),
      // },
    ),
    eventsServices: addNamespace<EventsServices>(
      EventsServices.namespaceEndpoint,
      { onConnectError },
    ),
    bookstoreServices: addNamespace<BookstoreServices>(
      BookstoreServices.namespaceEndpoint,
      { onConnectError },
    ),
    collectionServices: addNamespace<CollectionServices>(
      CollectionServices.namespaceEndpoint,
      { onConnectError, session },
    ),
    coverIdServices: addNamespace<CoverIdServices>(
      CoverIdServices.namespaceEndpoint,
      { onConnectError },
    ),
  };
};
