import dayjs from "dayjs";

import {
  endpoint as appEndpoint,
  type ClientEvents as AppEvents,
} from "~dm-services/app";
import {
  endpoint as authEndpoint,
  type ClientEvents as AuthEvents,
} from "~dm-services/auth";
import {
  endpoint as bookcaseEndpoint,
  type ClientEvents as BookcaseEvents,
  authedEndpoint as userBookcaseEndpoint,
  type AuthedClientEvents as UserBookcaseEvents,
} from "~dm-services/bookcase";
import {
  endpoint as bookstoresEndpoint,
  type ClientEvents as BookstoreEvents,
  adminEndpoint as adminBookstoresEndpoint,
  type AdminClientEvents as AdminBookstoreEvents,
} from "~dm-services/bookstores";
import {
  endpoint as coaEndpoint,
  type ClientEvents as CoaEvents,
} from "~dm-services/coa";
import {
  endpoint as collectionEndpoint,
  type ClientEvents as CollectionEvents,
} from "~dm-services/collection";
import {
  endpoint as coverIdEndpoint,
  type ClientEvents as CoverIdEvents,
} from "~dm-services/cover-id";
import {
  endpoint as edgecreatorEndpoint,
  type ClientEvents as EdgeCreatorEvents,
} from "~dm-services/edgecreator";
import {
  endpoint as edgesEndpoint,
  type ClientEvents as EdgesEvents,
} from "~dm-services/edges";
import {
  endpoint as eventsEndpoint,
  type ClientEvents as EventsEvents,
} from "~dm-services/events";
import {
  endpoint as globalStatsEndpoint,
  type ClientEvents as GlobalStatsEvents,
  type UserClientEvents as UserGlobalStatsEvents,
  userEndpoint as userGlobalStatsEndpoint,
} from "~dm-services/global-stats";
import {
  endpoint as presentationTextEndpoint,
  type ClientEvents as PresentationTextEvents,
} from "~dm-services/presentation-text";
import {
  endpoint as publicCollectionEndpoint,
  type ClientEvents as PublicCollectionEvents,
} from "~dm-services/public-collection";
import {
  endpoint as statsEndpoint,
  type ClientEvents as StatsEvents,
} from "~dm-services/stats";
import type { AxiosStorage, SocketClient } from "~socket.io-client-services";

const defaultExport = (options: {
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
}) => {
  const socket = inject("dmSocket") as SocketClient;
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
    publicCollection: socket.addNamespace<PublicCollectionEvents>(
      publicCollectionEndpoint,
    ),
    app: socket.addNamespace<AppEvents>(appEndpoint),

    bookcase: socket.addNamespace<BookcaseEvents>(bookcaseEndpoint, {
      session,
    }),
    userBookcase: socket.addNamespace<UserBookcaseEvents>(
      userBookcaseEndpoint,
      {
        session,
      },
    ),
    stats: socket.addNamespace<StatsEvents>(statsEndpoint, {
      session,
      cache: {
        storage: cacheStorage,
        ttl: (event) => (event === "getSuggestionsForCountry" ? until4am() : 0),
      },
    }),
    auth: socket.addNamespace<AuthEvents>(authEndpoint, {
      session,
    }),
    edgeCreator: socket.addNamespace<EdgeCreatorEvents>(edgecreatorEndpoint, {
      session,
    }),
    presentationText: socket.addNamespace<PresentationTextEvents>(
      presentationTextEndpoint,
    ),
    edges: socket.addNamespace<EdgesEvents>(edgesEndpoint, {}),
    coa: socket.addNamespace<CoaEvents>(coaEndpoint, {
      cache: {
        storage: cacheStorage,
        ttl: until4am(),
      },
    }),
    globalStats: socket.addNamespace<GlobalStatsEvents>(globalStatsEndpoint, {
      cache: {
        storage: cacheStorage,
        ttl: 1000, // 1 second only, because we want to always get the latest data but still cache in case of offline
      },
    }),
    userGlobalStats: socket.addNamespace<UserGlobalStatsEvents>(
      userGlobalStatsEndpoint,
      {
        cache: {
          storage: cacheStorage,
          ttl: 1000, // 1 second only, because we want to always get the latest data but still cache in case of offline
        },
      },
    ),
    events: socket.addNamespace<EventsEvents>(eventsEndpoint, {}),
    bookstore: socket.addNamespace<BookstoreEvents>(bookstoresEndpoint),
    adminBookstore: socket.addNamespace<AdminBookstoreEvents>(
      adminBookstoresEndpoint,
    ),
    collection: socket.addNamespace<CollectionEvents>(collectionEndpoint, {
      session,
      // cache: {
      //   storage: cacheStorage,
      //   disableCache: (eventName) => eventName.indexOf("get") !== 0,
      //   ttl: 1000, // 1 second only, because we want to always get the latest data but still cache in case of offline
      // },
    }),
    coverId: socket.addNamespace<CoverIdEvents>(coverIdEndpoint, {}),
  };
};

export default defaultExport;

export const socketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
