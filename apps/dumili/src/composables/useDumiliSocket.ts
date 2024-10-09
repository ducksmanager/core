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
import PresentationTextServices from "~dm-services/presentation-text/types";
import PublicCollectionServices from "~dm-services/public-collection/types";
import StatsServices from "~dm-services/stats/types";
import type { AxiosStorage } from "~socket.io-client-services";
import type { SocketClient } from "~socket.io-client-services";

const defaultExport = (options: {
  cacheStorage: AxiosStorage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectError: (e: any, namespace: string) => Promise<void> | void;
  session: {
    getToken: () => Promise<string | null | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const { session, cacheStorage } = options;
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

  const socket = inject("dmSocket") as SocketClient;

  return {
    options,
    publicCollection: socket.addNamespace<PublicCollectionServices>(
      PublicCollectionServices.namespaceEndpoint,
    ),

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
      { session },
    ),
    coverId: socket.addNamespace<CoverIdServices>(
      CoverIdServices.namespaceEndpoint,
      {},
    ),
  };
};

export default defaultExport;

export const dumiliSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
