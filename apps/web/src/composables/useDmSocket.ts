import dayjs from "dayjs";
import type { AxiosStorage, SocketClient } from "socket-call-client";

import { type ClientEvents as AppEvents } from "~dm-services/app";
import { type ClientEvents as AuthEvents } from "~dm-services/auth";
import {
  type AuthedClientEvents as UserBookcaseEvents,
  type ClientEvents as BookcaseEvents,
} from "~dm-services/bookcase";
import {
  type AdminClientEvents as AdminBookstoreEvents,
  type ClientEvents as BookstoreEvents,
} from "~dm-services/bookstores";
import { type ClientEvents as CoaEvents } from "~dm-services/coa";
import { type ClientEvents as CollectionEvents } from "~dm-services/collection";
import { type ClientEvents as CoverIdEvents } from "~dm-services/cover-id";
import { type ClientEvents as EdgeCreatorEvents } from "~dm-services/edgecreator";
import { type ClientEvents as EdgesEvents } from "~dm-services/edges";
import { type ClientEvents as EventsEvents } from "~dm-services/events";
import { type ClientEvents as GlobalStatsEvents } from "~dm-services/global-stats";
import { type ClientEvents as GlobalStatsUserEvents } from "~dm-services/global-stats-user";
import namespaces from "~dm-services/namespaces";
import { type ClientEvents as PresentationTextEvents } from "~dm-services/presentation-text";
import { type ClientEvents as PublicCollectionEvents } from "~dm-services/public-collection";
import { type ClientEvents as StatsEvents } from "~dm-services/stats";
import { type ClientEvents as StorySearchEvents } from "~dm-services/story-search";

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

  const storySearchSocket = inject("storySearchSocket") as SocketClient;

  for (const eachSocket of [socket, storySearchSocket]) {
    if (eachSocket) {
      eachSocket.onConnectError = onConnectError;
      if (onConnected) {
        eachSocket.onConnected = onConnected;
      }
    }
  }

  return {
    socket,
    options,
    publicCollection: socket.addNamespace<PublicCollectionEvents>(
      namespaces.PUBLIC_COLLECTION,
    ),
    app: socket.addNamespace<AppEvents>(namespaces.APP),

    bookcase: socket.addNamespace<BookcaseEvents>(namespaces.BOOKCASE, {
      session,
    }),
    userBookcase: socket.addNamespace<UserBookcaseEvents>(
      namespaces.BOOKCASE_USER,
      {
        session,
      },
    ),
    stats: socket.addNamespace<StatsEvents>(namespaces.STATS, {
      session,
      cache: {
        storage: cacheStorage,
        ttl: (event) => (event === "getSuggestionsForCountry" ? until4am() : 0),
      },
    }),
    auth: socket.addNamespace<AuthEvents>(namespaces.AUTH, {
      session,
    }),
    edgeCreator: socket.addNamespace<EdgeCreatorEvents>(
      namespaces.EDGECREATOR,
      {
        session,
      },
    ),
    presentationText: socket.addNamespace<PresentationTextEvents>(
      namespaces.PRESENTATION_TEXT,
    ),
    edges: socket.addNamespace<EdgesEvents>(namespaces.EDGES, {}),
    coa: socket.addNamespace<CoaEvents>(namespaces.COA, {
      cache: {
        storage: cacheStorage,
        ttl: until4am(),
      },
    }),
    globalStats: socket.addNamespace<GlobalStatsEvents>(
      namespaces.GLOBAL_STATS,
      {
        cache: {
          storage: cacheStorage,
          ttl: 1000, // 1 second only, because we want to always get the latest data but still cache in case of offline
        },
      },
    ),
    userGlobalStats: socket.addNamespace<GlobalStatsUserEvents>(
      namespaces.GLOBAL_STATS_USER,
      {
        session,
        cache: {
          storage: cacheStorage,
          ttl: 1000, // 1 second only, because we want to always get the latest data but still cache in case of offline
        },
      },
    ),
    events: socket.addNamespace<EventsEvents>(namespaces.EVENTS, {}),
    storySearch: storySearchSocket?.addNamespace<StorySearchEvents>(
      namespaces.STORY_SEARCH,
      {},
    ),
    bookstore: socket.addNamespace<BookstoreEvents>(namespaces.BOOKSTORES),
    adminBookstore: socket.addNamespace<AdminBookstoreEvents>(
      namespaces.BOOKSTORES_ADMIN,
      {
        session,
      },
    ),
    collection: socket.addNamespace<CollectionEvents>(namespaces.COLLECTION, {
      session,
      cache: {
        storage: cacheStorage,
        disableCache: (eventName) => eventName.indexOf("get") !== 0,
        ttl: 1000, // 1 second only, because we want to always get the latest data but still cache in case of offline
      },
    }),
    coverId: socket.addNamespace<CoverIdEvents>(namespaces.COVER_ID, {}),
  };
};

export default defaultExport;

export const socketInjectionKey = Symbol() as InjectionKey<
  ReturnType<typeof defaultExport>
>;
