import { CacheOptions } from "axios-cache-interceptor";
export { buildStorage, buildWebStorage } from "axios-cache-interceptor";
import { io, Socket } from "socket.io-client";
import { ref } from "vue";

type AllButLast<T extends any[]> = T extends [...infer H, infer _L] ? H : any[];

type Last<T extends unknown[]> = T extends [...infer _I, infer L] ? L : never;
export type LastParameter<F extends (...args: any) => unknown> = Last<
  Parameters<F>
>;

export type EventReturnTypeIncludingError<
  T extends (...args: any[]) => unknown
> =
  // @ts-expect-error ???
  LastParameter<LastParameter<T>>;

type SocketCacheOptions = Pick<CacheOptions, "ttl">;

interface EventsMap {
  [event: string]: any;
}

type StringKeyOf<T> = keyof T & string;

type EventCalls<S extends EventsMap> = {
  [EventName in StringKeyOf<S>]: (
    ...args: AllButLast<Parameters<S[EventName]>>
  ) => Promise<EventReturnTypeIncludingError<S[EventName]>>;
};

export const session = ref<{
  getToken: () => Promise<string | undefined>;
  clearSession: () => Promise<void>|void;
  sessionExists: () => Promise<boolean>;
  onConnectError: () => void;
}>();

export const cacheStorage = ref(
  undefined as CacheOptions["storage"] | undefined
); 

export const useSocket = (socketRootUrl: string) => ({
   addNamespace: <Services extends EventsMap>(
    namespaceName: string,
    cacheOptions?: Required<SocketCacheOptions>) =>new Proxy({} as EventCalls<Services> & { connect: () => void }, {
    get:
      <EventName extends StringKeyOf<Services>>(_: never, event: EventName) =>
      async (
        ...args: AllButLast<Parameters<Services[EventName]>>
      ): Promise<
        EventReturnTypeIncludingError<Services[EventName]> | undefined
      > => {
        const socket = io(socketRootUrl + namespaceName, {
          multiplex: false,
          auth: async (cb) => {
            if (!session.value) {
              return;
            }
            cb({
              token: await session.value.getToken(),
            });
          },
        }).on("connect_error", (e) => {
          if (session.value?.onConnectError) {
            session.value.onConnectError();
            console.trace(`Namespace ${namespaceName}: connect_error: ${e}`);
          } else {
            console.trace(
              `Namespace ${namespaceName}: onConnectError is not defined`
            );
          }
        });
        if (event === "connect") {
          socket.connect();
          return;
        }
        let data;
        if (cacheOptions) {
          if (!cacheStorage.value) {
            throw new Error("storage must be defined");
          }
          const cacheKey = `${event} ${JSON.stringify(args)}`;
          const cacheData = (await cacheStorage.value.get(cacheKey)) as Awaited<
            ReturnType<Socket["emitWithAck"]>
          >;
          const hasCacheData =
            cacheData !== undefined &&
            !(typeof cacheData === "object" && cacheData.state === "empty");
          if (hasCacheData) {
            return cacheData;
          }
          data = await socket.emitWithAck(event, ...args);
          cacheStorage.value.set(cacheKey, data);
        } else {
          data = await socket.emitWithAck(event, ...args);
        }
        return data;
      },
  })
})
