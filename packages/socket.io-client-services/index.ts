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
  public addNamespace<Services extends EventsMap>(
    namespaceName: string,
    namespaceOptions: {
      session?: {
        getToken: () => Promise<string | null | undefined>;
        clearSession: () => Promise<void> | void;
        sessionExists: () => Promise<boolean>;
      };
      cache?: Required<SocketCacheOptions<Services>>;
    } = {}
  ) {
    const { session, cache } = namespaceOptions;
    const socket = io(this.socketRootUrl + namespaceName, {
      extraHeaders: {
        "X-Namespace": namespaceName,
      },
      multiplex: false,
      transports: ["websocket"],
      auth: async (cb) => {
        cb(session ? { token: await session.getToken() } : {});
      },
    })
      .on("connect_error", (e) => {
        this.onConnectError(e, namespaceName);
      })
      .on("connect", () => {
        console.log("connected to", namespaceName);
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
            const startTime = Date.now();
            const eventConsoleString = `${namespaceName}/${event}(${args.join(", ")})`;
            const debugCall = (post: boolean = false) =>
              console.debug(
                `${eventConsoleString} ${post ? `responded in ${Date.now() - startTime}ms` : "called"}`
              );
            let cacheKey;
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
                console.debug(`${eventConsoleString} served from cache`);
                return cacheData;
              }
            }
            debugCall();
            const data = await socket.emitWithAck(event, ...args);
            if (cache && cacheKey) {
              cache.storage.set(cacheKey, data);
            }
            debugCall(true);
            return data;
          },
      }),
    };
  }
}
