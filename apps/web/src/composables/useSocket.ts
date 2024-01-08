import { buildWebStorage, CacheOptions } from "axios-cache-interceptor";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";
import { AllButLast } from "socket.io-client/build/esm/socket";

import {
  NamespaceEndpoint as AuthNamespaceEndpoint,
  Services as AuthServices,
} from "~services/auth/types";
import {
  NamespaceEndpoint as BookcaseNamespaceEndpoint,
  Services as BookcaseServices,
} from "~services/bookcase/types";
import {
  NamespaceEndpoint as BookstoreNamespaceEndpoint,
  Services as BookstoreServices,
} from "~services/bookstores/types";
import {
  NamespaceEndpoint as CoaNamespaceEndpoint,
  Services as CoaServices,
} from "~services/coa/types";
import {
  NamespaceEndpoint as SubscriptionNamespaceEndpoint,
  Services as SubscriptionServices,
} from "~services/collection/types";
import {
  NamespaceEndpoint as CollectionNamespaceEndpoint,
  Services as CollectionServices,
} from "~services/collection/types";
import {
  NamespaceEndpoint as DemoNamespaceEndpoint,
  Services as DemoServices,
} from "~services/demo/types";
import {
  NamespaceEndpoint as EdgeCreatorNamespaceEndpoint,
  Services as EdgeCreatorServices,
} from "~services/edgecreator/types";
import {
  NamespaceEndpoint as EdgesNamespaceEndpoint,
  Services as EdgesServices,
} from "~services/edges/types";
import {
  NamespaceEndpoint as EventsNamespaceEndpoint,
  Services as EventsServices,
} from "~services/events/types";
import {
  NamespaceEndpoint as GlobalStatsNamespaceEndpoint,
  Services as GlobalStatsServices,
} from "~services/global-stats/types";
import {
  NamespaceEndpoint as LoginNamespaceEndpoint,
  Services as LoginServices,
} from "~services/login/types";
import {
  NamespaceEndpoint as PresentationTextNamespaceEndpoint,
  Services as PresentationTextServices,
} from "~services/presentation-text/types";
import {
  NamespaceEndpoint as PublicCollectionNamespaceEndpoint,
  Services as PublicCollectionServices,
} from "~services/public-collection/types";
import {
  NamespaceEndpoint as StatsNamespaceEndpoint,
  Services as StatsServices,
} from "~services/stats/types";
import { EventReturnTypeIncludingError } from "~services/types";
type SocketCacheOptions = Pick<CacheOptions, "storage" | "ttl">;

interface EventsMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [event: string]: any;
}

type StringKeyOf<T> = keyof T & string;

type EventCalls<S extends EventsMap> = {
  [EventName in StringKeyOf<S>]: (
    ...args: AllButLast<Parameters<S[EventName]>>
  ) => Promise<EventReturnTypeIncludingError<S[EventName]>>;
};

const useSocket = <Services extends EventsMap>(
  namespaceName: string,
  cacheOptions?: Required<SocketCacheOptions>,
) => {
  const socket = io(import.meta.env.VITE_SOCKET_URL + namespaceName, {
    auth: (cb) => {
      cb({
        token: Cookies.get("token"),
      });
    },
  });

  return new Proxy<EventCalls<Services>>({} as EventCalls<Services>, {
    get:
      <EventName extends StringKeyOf<Services>>(_: never, event: EventName) =>
      async (
        ...args: AllButLast<Parameters<Services[EventName]>>
      ): Promise<EventReturnTypeIncludingError<Services[EventName]>> => {
        let data;
        if (cacheOptions) {
          const cacheKey = `${event} ${JSON.stringify(args)}`;
          const cacheData = await cacheOptions.storage.get(cacheKey);
          if (cacheData !== undefined) {
            return cacheData as Awaited<ReturnType<Socket["emitWithAck"]>>;
          }
          data = await socket.emitWithAck(event, ...args);
          cacheOptions.storage.set(cacheKey, data);
        } else {
          data = await socket.emitWithAck(event, ...args);
        }
        return data;
      },
  });
};

const oneHour = () => dayjs().add(1, "hour").diff(dayjs());
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
  PublicCollectionNamespaceEndpoint,
);
export const loginServices = useSocket<LoginServices>(LoginNamespaceEndpoint);

export const bookcaseServices = useSocket<BookcaseServices>(
  BookcaseNamespaceEndpoint,
);
export const demoServices = useSocket<DemoServices>(DemoNamespaceEndpoint);
export const statsServices = useSocket<StatsServices>(StatsNamespaceEndpoint);

export const authServices = useSocket<AuthServices>(AuthNamespaceEndpoint);
export const edgeCreatorServices = useSocket<EdgeCreatorServices>(
  EdgeCreatorNamespaceEndpoint,
);

export const presentationTextServices = useSocket<PresentationTextServices>(
  PresentationTextNamespaceEndpoint,
);
export const edgesServices = useSocket<EdgesServices>(EdgesNamespaceEndpoint);

export const coaServices = useSocket<CoaServices>(CoaNamespaceEndpoint, {
  storage: buildWebStorage(sessionStorage),
  ttl: until4am(),
});
export const globalStatsServices = useSocket<GlobalStatsServices>(
  GlobalStatsNamespaceEndpoint,
  {
    storage: buildWebStorage(sessionStorage),
    ttl: oneHour(),
  },
);
export const eventsServices = useSocket<EventsServices>(
  EventsNamespaceEndpoint,
);
export const bookstoreServices = useSocket<BookstoreServices>(
  BookstoreNamespaceEndpoint,
);
export const collectionServices = useSocket<CollectionServices>(
  CollectionNamespaceEndpoint,
);

export const subscriptionServices = useSocket<SubscriptionServices>(
  SubscriptionNamespaceEndpoint,
);
