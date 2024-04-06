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

const defaultExport = (options: {
  cacheStorage: AxiosStorage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConnectError: (e: any, namespace: string) => Promise<void> | void;
  session: {
    getToken: () => Promise<string | undefined>;
    clearSession: () => void;
    sessionExists: () => Promise<boolean>;
  };
}) => {
  const { session, onConnectError, cacheStorage } = options;
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
    publicCollection: addNamespace<PublicCollectionServices>(
      PublicCollectionServices.namespaceEndpoint,
      { onConnectError },
    ),
    login: addNamespace<LoginServices>(LoginServices.namespaceEndpoint, {
      onConnectError,
    }),

    bookcase: addNamespace<BookcaseServices>(
      BookcaseServices.namespaceEndpoint,
      { onConnectError, session },
    ),
    stats: addNamespace<StatsServices>(StatsServices.namespaceEndpoint, {
      onConnectError,
      session,
    }),
    auth: addNamespace<AuthServices>(AuthServices.namespaceEndpoint, {
      onConnectError,
      session,
    }),
    edgeCreator: addNamespace<EdgeCreatorServices>(
      EdgeCreatorServices.namespaceEndpoint,
      { onConnectError },
    ),
    presentationText: addNamespace<PresentationTextServices>(
      PresentationTextServices.namespaceEndpoint,
      { onConnectError },
    ),
    edges: addNamespace<EdgesServices>(EdgesServices.namespaceEndpoint, {
      onConnectError,
    }),
    coa: addNamespace<CoaServices>(CoaServices.namespaceEndpoint, {
      onConnectError,
      cache: {
        storage: cacheStorage,
        ttl: until4am(),
      },
    }),
    globalStats: addNamespace<GlobalStatsServices>(
      GlobalStatsServices.namespaceEndpoint,
      { onConnectError },
      // {
      //   ttl: oneHour(),
      // },
    ),
    events: addNamespace<EventsServices>(EventsServices.namespaceEndpoint, {
      onConnectError,
    }),
    bookstore: addNamespace<BookstoreServices>(
      BookstoreServices.namespaceEndpoint,
      { onConnectError },
    ),
    collection: addNamespace<CollectionServices>(
      CollectionServices.namespaceEndpoint,
      { onConnectError, session },
    ),
    coverId: addNamespace<CoverIdServices>(CoverIdServices.namespaceEndpoint, {
      onConnectError,
    }),
  };
};

export default defaultExport;

export const dmSocketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
