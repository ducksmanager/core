import dayjs from "dayjs";

import AppServices from "~dm-services/app/types";
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
import type { SocketClient } from "~socket.io-client-services";

const defaultExport = (
  socket: SocketClient,
  options: {
    cacheStorage: AxiosStorage;

    onConnectError: (
      e: Error,
      namespace: string,
      eventName?: string,
    ) => Promise<void> | void;
    onConnected?: (namespace: string) => void;
    session: {
      getToken: () => Promise<string | null | undefined>;
      clearSession: () => void;
      sessionExists: () => Promise<boolean>;
    };
  },
) => {
  const { session, cacheStorage, onConnectError, onConnected } = options;
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

  socket.onConnectError = onConnectError;
  if (onConnected) {
    socket.onConnected = onConnected;
  }
  return {
    socket,
    options,
    publicCollection: socket.addNamespace<PublicCollectionServices>(
      PublicCollectionServices.namespaceEndpoint,
    ),
    app: socket.addNamespace<AppServices>(AppServices.namespaceEndpoint),
    login: socket.addNamespace<LoginServices>(LoginServices.namespaceEndpoint),

    bookcase: socket.addNamespace<BookcaseServices>(
      BookcaseServices.namespaceEndpoint,
      { session },
    ),
    stats: socket.addNamespace<StatsServices>(StatsServices.namespaceEndpoint, {
      session,
      cache: {
        storage: cacheStorage,
        ttl: (event) => (event === "getSuggestionsForCountry" ? until4am() : 0),
      },
    }),
    auth: socket.addNamespace<AuthServices>(AuthServices.namespaceEndpoint, {
      session,
    }),
    edgeCreator: socket.addNamespace<EdgeCreatorServices>(
      EdgeCreatorServices.namespaceEndpoint,
      { session },
    ),
    presentationText: socket.addNamespace<PresentationTextServices>(
      PresentationTextServices.namespaceEndpoint,
    ),
    edges: socket.addNamespace<EdgesServices>(
      EdgesServices.namespaceEndpoint,
      {},
    ),
    coa: socket.addNamespace<CoaServices>(CoaServices.namespaceEndpoint, {
      cache: {
        storage: cacheStorage,
        ttl: until4am(),
      },
    }),
    globalStats: socket.addNamespace<GlobalStatsServices>(
      GlobalStatsServices.namespaceEndpoint,
      {
        cache: {
          storage: cacheStorage,
          ttl: 1000, // 1 second only, because we want to always get the latest data but still cache in case of offline
        },
      },
    ),
    events: socket.addNamespace<EventsServices>(
      EventsServices.namespaceEndpoint,
      {},
    ),
    bookstore: socket.addNamespace<BookstoreServices>(
      BookstoreServices.namespaceEndpoint,
    ),
    collection: socket.addNamespace<CollectionServices>(
      CollectionServices.namespaceEndpoint,
      {
        session,
        cache: {
          storage: cacheStorage,
          ttl: 1000, // 1 second only, because we want to always get the latest data but still cache in case of offline
        },
      },
    ),
    coverId: socket.addNamespace<CoverIdServices>(
      CoverIdServices.namespaceEndpoint,
      {},
    ),
  };
};

export default defaultExport;

export const socketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
