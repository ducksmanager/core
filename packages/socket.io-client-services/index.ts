import type {
  AxiosStorage,
  CacheOptions,
  NotEmptyStorageValue,
} from "axios-cache-interceptor";
export type { AxiosStorage, NotEmptyStorageValue };
export { buildStorage, buildWebStorage } from "axios-cache-interceptor";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { ref } from "vue";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllButLast<T extends any[]> = T extends [...infer H, infer _L] ? H : any[];

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
  constructor(private socketRootUrl: string) { }

  public cacheHydrator = {
    state: ref<null | {
      mode: "LOAD_CACHE" | "HYDRATE";
      cachedCallsDone: string[];
      hydratedCallsDoneAmount: number;
    }>(null),
    run: async (
      loadCachedDataFn: () => Promise<void>,
      loadRealDataFn: () => void
    ) => {
      this.cacheHydrator.state.value = {
        mode: "LOAD_CACHE",
        cachedCallsDone: [],
        hydratedCallsDoneAmount: 0,
      };

      console.log("loading cache...");
      await loadCachedDataFn();

      this.cacheHydrator.state.value.mode = "HYDRATE";
      this.cacheHydrator.state.value.hydratedCallsDoneAmount = 0;

      console.log("Hydrating...");
      loadRealDataFn();
    },
  };

  public onConnectError = (e: Error, namespace: string, _eventName?: string) => {
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

    const connect = () => {
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
          console.log("connect_error", namespaceName);
          this.onConnectError(e, namespaceName);
        })
        .on("connect", () => {
          isOffline = false;
          console.log(
            `connected to ${namespaceName} at ${new Date().toISOString()}`
          );

          this.onConnected(namespaceName);
        });
    };

    return {
      socket,
      connect,
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
                  `connecting to ${namespaceName} at ${new Date().toISOString()}`
                );
                connect();
              }
              const startTime = Date.now();
              const eventConsoleString = `${namespaceName}/${event}(${JSON.stringify(args)})`;
              const debugCall = async (post: boolean = false) => {
                const token = await session?.getToken();
                if (event !== "toJSON") {
                  console.debug(
                    `${eventConsoleString} ${post ? `responded in ${Date.now() - startTime}ms` : `called ${token ? "with token" : "without token"}`} at ${new Date().toISOString()}`
                  );
                }
              };
              let cacheKey;
              if (cache) {
                debugger
                cacheKey = `${namespaceName}/${event} ${JSON.stringify(args)}`;
                const cacheData = await cache.storage.get(cacheKey, {
                  cache: {
                    ttl:
                      isOffline ||
                        this.cacheHydrator.state.value?.mode === "LOAD_CACHE"
                        ? undefined
                        : typeof cache.ttl === "function"
                          ? cache.ttl(event, args)
                          : cache.ttl,
                  },
                });
                isCacheUsed =
                  cacheData !== undefined &&
                  !(typeof cacheData === "object" && cacheData.state === "empty");
                if (isCacheUsed) {
                  console.debug(`${eventConsoleString} served from cache`);
                  if (this.cacheHydrator.state.value) {
                    switch (this.cacheHydrator.state.value.mode) {
                      case "LOAD_CACHE":
                        this.cacheHydrator.state.value.cachedCallsDone.push(
                          eventConsoleString
                        );
                        break;
                      case "HYDRATE":
                        if (
                          this.cacheHydrator.state.value.cachedCallsDone.includes(
                            eventConsoleString
                          )
                        ) {
                          this.cacheHydrator.state.value.hydratedCallsDoneAmount++;
                          console.log("this.cacheHydrator.state.value.hydratedCallsDoneAmount", this.cacheHydrator.state.value.hydratedCallsDoneAmount)
                        }
                        break;
                    }
                  }
                  return (
                    cacheData as unknown as {
                      value: Awaited<ReturnType<Socket["emitWithAck"]>>;
                    }
                  ).value;
                }
              }

              socket!.on("connect_error", (e) => {
                isOffline = true;

                this.onConnectError(
                  e.message === "websocket error"
                    ? {
                      message: "offline_no_cache",
                      name: "offline_no_cache",
                    }
                    : e,
                  namespaceName,
                  event
                );
              });

              await debugCall();
              const data = await socket!.emitWithAck(event, ...args);
              await debugCall(true);
              if (cache && cacheKey) {
                cache.storage.set(cacheKey, data, {
                  timeout:
                    typeof cache.ttl === "function"
                      ? cache.ttl(event, args)
                      : cache.ttl,
                });
              }
              if (
                this.cacheHydrator.state.value?.mode === "HYDRATE" &&
                this.cacheHydrator.state.value.cachedCallsDone.includes(
                  eventConsoleString
                )
              ) {
                this.cacheHydrator.state.value.hydratedCallsDoneAmount++;
              }
              return data;
            },
      }),
    };
  }
}
