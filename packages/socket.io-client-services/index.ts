import type {
  CacheOptions,
  NotEmptyStorageValue,
  AxiosStorage,
} from "axios-cache-interceptor";
export type { AxiosStorage, NotEmptyStorageValue };
export { buildStorage, buildWebStorage } from "axios-cache-interceptor";
import { io, Socket } from "socket.io-client";

type AllButLast<T extends any[]> = T extends [...infer H, infer _L] ? H : any[];

type Last<T extends unknown[]> = T extends [...infer _I, infer L] ? L : never;
export type LastParameter<F extends (...args: any) => unknown> = Last<
  Parameters<F>
>;

export type EventReturnTypeIncludingError<
  T extends (...args: any[]) => unknown
> =
  // @ts-ignore ???
  LastParameter<LastParameter<T>>;

type SocketCacheOptions<Services extends EventsMap> = Pick<
  CacheOptions,
  "storage"
> & {
  ttl: number | ((event: StringKeyOf<Services>, args: any[]) => number);
};

interface EventsMap {
  [event: string]: any;
}

type StringKeyOf<T> = keyof T & string;

export type EventCalls<S extends EventsMap> = {
  [EventName in StringKeyOf<S>]: (
    ...args: AllButLast<Parameters<S[EventName]>>
  ) => Promise<EventReturnTypeIncludingError<S[EventName]>>;
};

export const useSocket = (socketRootUrl: string) => ({
  addNamespace: <Services extends EventsMap>(
    namespaceName: string,
    namespaceOptions: {
      onConnectError: (e: Error, namespace: string) => void;
      session?: {
        getToken: () => Promise<string | null | undefined>;
        clearSession: () => Promise<void> | void;
        sessionExists: () => Promise<boolean>;
      };
      cache?: Required<SocketCacheOptions<Services>>;
    } = {
        onConnectError(e, namespace) {
          console.error(`${namespace}: connect_error: ${e}`);
        },
      }
  ) => {
    const { session, onConnectError, cache } = namespaceOptions;
    const socket = io(socketRootUrl + namespaceName, {
      multiplex: false,
      auth: async (cb) => {
        cb(session ? { token: await session.getToken() } : {});
      },
    }).on("connect_error", (e) => {
      onConnectError(e, namespaceName);
    });

    return {
      socket,
      services: new Proxy({} as EventCalls<Services>, {
        get:
          <EventName extends StringKeyOf<Services>>(
            _: never,
            event: EventName
          ) =>
            async (
              ...args: AllButLast<Parameters<Services[EventName]>>
            ): Promise<
              EventReturnTypeIncludingError<Services[EventName]> | undefined
            > => {
              let data;
              let startTime = Date.now();
              const debugCall = (post: boolean = false) => console.debug(
                `${post ? 'Called' : 'Calling'} socket event`,
                `${namespaceName}/${event}`,
                args,
                post ? `in ${Date.now() - startTime}ms` : ''
              );
              let cacheKey
              if (cache) {
                cacheKey = `${event} ${JSON.stringify(args)}`;
                const cacheData = (await cache.storage.get(cacheKey, {
                  cache: {
                    ttl:
                      typeof cache.ttl === "function"
                        ? cache.ttl(event, args)
                        : cache.ttl,
                  },
                })) as Awaited<ReturnType<Socket["emitWithAck"]>>;
                const hasCacheData =
                  cacheData !== undefined &&
                  !(typeof cacheData === "object" && cacheData.state === "empty");
                if (hasCacheData) {
                  console.debug("Using cache for socket event", event, args);
                  return cacheData;
                }
              }
              debugCall()
              data = await socket.emitWithAck(event, ...args);
              if (cache && cacheKey) {
                cache.storage.set(cacheKey, data);
              }
              debugCall(true)
              return data;
            },
      }),
    };
  },
});
