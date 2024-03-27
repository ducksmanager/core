import type {
  CacheOptions,
  NotEmptyStorageValue,
  AxiosStorage
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

type SocketCacheOptions = Pick<CacheOptions, "ttl">;

interface EventsMap {
  [event: string]: any;
}

type StringKeyOf<T> = (keyof T|"socket") & string;

type EventCalls<S extends EventsMap> = {
  [EventName in StringKeyOf<S>]: (
    ...args: AllButLast<Parameters<S[EventName]>>
  ) => Promise<EventReturnTypeIncludingError<S[EventName]>>;
} & {socket: () => Promise<Socket>};

export const useSocket = (
  socketRootUrl: string,
  options: {
    cacheStorage?: CacheOptions["storage"];
  } = {}
) => ({
  addNamespace: <Services extends EventsMap>(
    namespaceName: string,
    namespaceOptions: {
      session?: {
        getToken: () => Promise<string | undefined>;
        clearSession: () => Promise<void> | void;
        sessionExists: () => Promise<boolean>;
        onConnectError: (e: any, namespace: string) => void;
      },
      cache?: Required<SocketCacheOptions>
    } = {}
  ) =>
    new Proxy({} as EventCalls<Services> & { socket: Socket }, {
      get:
        <EventName extends StringKeyOf<Services>>(_: never, event: EventName) =>
          async (
            ...args: AllButLast<Parameters<Services[EventName]>>
          ): Promise<EventName extends "socket" ? Socket:
            EventReturnTypeIncludingError<Services[EventName]> | undefined
          > => {
            const socket = io(socketRootUrl + namespaceName, {
              multiplex: false,
              timeout: 2500,
              auth: async (cb) => {
                if (!namespaceOptions.session) {
                  return;
                }
                const token = await namespaceOptions.session.getToken();
                cb({
                  token,
                });
              },
            }).on("connect_error", (e) => {
              if (namespaceOptions.session?.onConnectError) {
                namespaceOptions.session.onConnectError(e, namespaceName);
                console.error(`Namespace ${namespaceName}: connect_error: ${e}`);
                throw e;
              } else {
                console.error(
                  `Namespace ${namespaceName}: onConnectError is not defined`
                );
                throw e;
              }
            });
            if (event === "socket") {
              return new Promise(() => socket);
            }
            let data;
            if (namespaceOptions.cache) {
              if (!options.cacheStorage) {
                throw new Error("storage must be defined");
              }
              const cacheKey = `${event} ${JSON.stringify(args)}`;
              const cacheData = (await options!.cacheStorage.get(
                cacheKey
              )) as Awaited<ReturnType<Socket["emitWithAck"]>>;
              const hasCacheData =
                cacheData !== undefined &&
                !(typeof cacheData === "object" && cacheData.state === "empty");
              if (hasCacheData) {
                return cacheData;
              }
              data = await socket.emitWithAck(event, ...args);
              options.cacheStorage.set(cacheKey, data);
            } else {
              data = await socket.emitWithAck(event, ...args);
            }
            return data;
          },
    }),
});
