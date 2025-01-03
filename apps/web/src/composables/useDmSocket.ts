import dayjs from "dayjs";

import {
  type ClientEvents as AppEvents,
  endpoint as appEndpoint,
} from "~dm-services/app";
import {
  type ClientEvents as AuthEvents,
  endpoint as authEndpoint,
} from "~dm-services/auth";
import {
  type AuthedClientEvents as UserBookcaseEvents,
  authedEndpoint as userBookcaseEndpoint,
  type ClientEvents as BookcaseEvents,
  endpoint as bookcaseEndpoint,
} from "~dm-services/bookcase";
import {
  type AdminClientEvents as AdminBookstoreEvents,
  adminEndpoint as adminBookstoresEndpoint,
  type ClientEvents as BookstoreEvents,
  endpoint as bookstoresEndpoint,
} from "~dm-services/bookstores";
import {
  type ClientEvents as CoaEvents,
  endpoint as coaEndpoint,
} from "~dm-services/coa";
import {
  type ClientEvents as CollectionEvents,
  endpoint as collectionEndpoint,
} from "~dm-services/collection";
import {
  type ClientEvents as CoverIdEvents,
  endpoint as coverIdEndpoint,
} from "~dm-services/cover-id";
import {
  type ClientEvents as EdgeCreatorEvents,
  endpoint as edgecreatorEndpoint,
} from "~dm-services/edgecreator";
import {
  type ClientEvents as EdgesEvents,
  endpoint as edgesEndpoint,
} from "~dm-services/edges";
import {
  type ClientEvents as EventsEvents,
  endpoint as eventsEndpoint,
} from "~dm-services/events";
import {
  type ClientEvents as GlobalStatsEvents,
  endpoint as globalStatsEndpoint,
  type UserClientEvents as UserGlobalStatsEvents,
  userEndpoint as userGlobalStatsEndpoint,
} from "~dm-services/global-stats";
import {
  type ClientEvents as PresentationTextEvents,
  endpoint as presentationTextEndpoint,
} from "~dm-services/presentation-text";
import {
  type ClientEvents as PublicCollectionEvents,
  endpoint as publicCollectionEndpoint,
} from "~dm-services/public-collection";
import {
  type ClientEvents as StatsEvents,
  endpoint as statsEndpoint,
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
