import type {
  AxiosStorage,
  CacheOptions,
  NotEmptyStorageValue,
} from "axios-cache-interceptor";
export type { AxiosStorage, NotEmptyStorageValue };
export { buildStorage, buildWebStorage } from "axios-cache-interceptor";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
type AllButLast<T extends any[]> = T extends [...infer H, infer _L] ? H : any[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Last<T extends unknown[]> = T extends [...infer _I, infer L] ? L : never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LastParameter<F extends (...args: any) => unknown> = Last<
  Parameters<F>
>;

export type EventReturnTypeIncludingError<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => unknown,
> = LastParameter<LastParameter<T>>;

type SocketCacheOptions<Services extends EventsMap> = Pick<
  CacheOptions,
  "storage"
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ttl: number | ((event: StringKeyOf<Services>, args: any[]) => number);
};

interface EventsMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [event: string]: any;
}

type StringKeyOf<T> = keyof T & string;

export type EventCalls<S extends EventsMap> = {
  [EventName in StringKeyOf<S>]: (
    ...args: AllButLast<Parameters<S[EventName]>>
  ) => Promise<EventReturnTypeIncludingError<S[EventName]>>;
};

export class SocketClient {
  constructor(private socketRootUrl: string) {}

  public onConnectError = (e: Error, namespace: string) => {
    console.error(`${namespace}: connect_error: ${e}`);
  };
  public onConnected = (namespace: string) => {
    console.error(`${namespace}: connected`);
  };

  public addNamespace<Services extends EventsMap>(
    namespaceName: string,
    namespaceOptions: {
      onConnectError?: (e: Error, namespace: string) => void;
      onConnected?: (namespace: string) => void;

      session?: {
        getToken: () => Promise<string | null | undefined>;
        clearSession: () => Promise<void> | void;
        sessionExists: () => Promise<boolean>;
      };
      cache?: Required<SocketCacheOptions<Services>>;
    } = {}
  ) {
    const { session, cache } = namespaceOptions;
    let socket: Socket | undefined;

    let isOffline: boolean | undefined;

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
            let isCacheUsed = false;
            if (!socket) {
              console.log(
                "connecting to",
                namespaceName + " at " + new Date().toISOString()
              );
              socket = io(this.socketRootUrl + namespaceName, {
                extraHeaders: {
                  "X-Namespace": namespaceName,
                },
                timeout: 500,
                transports: ["websocket"],
                multiplex: false,
                auth: async (cb) => {
                  const token = await session?.getToken();
                  cb(token ? { token } : {});
                },
              })
                .on("connect_error", (e) => {
                  isOffline = true;
                  this.onConnectError(
                    isCacheUsed
                      ? e
                      : {
                          message: "offline_no_cache",
                          name: "offline_no_cache",
                        },
                    namespaceName
                  );
                })
                .on("connect", () => {
                  isOffline = false;
                  console.log(
                    `connected to ${namespaceName} at ${new Date().toISOString()}`
                  );

                  this.onConnected(namespaceName);
                });
            }
            const startTime = Date.now();
            const eventConsoleString = `${namespaceName}/${event}(${args.join(", ")})`;
            const debugCall = async (post: boolean = false) => {
              const token = await session?.getToken();
              return console.debug(
                `${eventConsoleString} ${post ? `responded in ${Date.now() - startTime}ms` : `called ${token ? "with token" : "without token"}`} at ${new Date().toISOString()}`
              );
            };
            let cacheKey;
            if (cache) {
              cacheKey = `${namespaceName}/${event} ${JSON.stringify(args)}`;
              const cacheData = (await cache.storage.get(cacheKey, {
                cache: {
                  ttl: isOffline
                    ? undefined
                    : typeof cache.ttl === "function"
                      ? cache.ttl(event, args)
                      : cache.ttl,
                },
              })) as Awaited<ReturnType<Socket["emitWithAck"]>>;
              isCacheUsed =
                cacheData !== undefined &&
                !(typeof cacheData === "object" && cacheData.state === "empty");
              if (isCacheUsed) {
                console.debug(`${eventConsoleString} served from cache`);
                return cacheData;
              }
            }
            await debugCall();
            const data = await socket.emitWithAck(event, ...args);
            await debugCall(true);
            if (cache && cacheKey) {
              cache.storage.set(cacheKey, data);
            }
            return data;
          },
      }),
    };
  }
}
