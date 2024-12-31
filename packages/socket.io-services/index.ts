import type { Namespace, Server, Socket } from "socket.io";
import { EventsMap } from "socket.io/dist/typed-events";

export type ScopedError<ErrorKey extends string = string> = {
  error: ErrorKey;
  message: string;
  selector: string;
};

export type EitherOr<A, B> = A | B extends object
  ?
      | (A & Partial<Record<Exclude<keyof B, keyof A>, never>>)
      | (B & Partial<Record<Exclude<keyof A, keyof B>, never>>)
  : A | B;

export type Errorable<T, ErrorKey extends string> = EitherOr<
  T,
  EitherOr<{ error: ErrorKey; errorDetails?: string }, ScopedError<ErrorKey>>
>;

export type ServerSentEndEvents<Events extends { [event: string]: any }> = {
  [K in keyof Events & string as `${K}End`]: Events[K];
};

export type ServerSentStartEndEvents<Events extends { [event: string]: any }> =
  Events & ServerSentEndEvents<Events>;

export const useSocketServices = <
  EmitEvents extends object = object,
  ServerSideEvents extends object = object,
  SocketData extends any = object,
>(
  namespaceEndpoint: string, //Parameters<Server["of"]>[0],
  options: {
    listenEvents: <Events extends EventsMap>(
      socket: Socket<Events, EmitEvents, ServerSideEvents, SocketData>
    ) => {
      [EventName in keyof Events]: (
        ...args: Parameters<Events[EventName]>
      ) => ReturnType<Events[EventName]>;
    };
    middlewares: Parameters<
      Namespace<ReturnType<typeof options.listenEvents>["E"], EmitEvents, ServerSideEvents, SocketData>["use"]
    >[0][];
  }
) => ({
  server: (io: Server) => {
    const namespace = io.of(namespaceEndpoint);
    for (const middleware of options?.middlewares ?? []) {
      namespace.use(middleware);
    }

    namespace.on("connection", (socket) => {
      if (options.listenEvents) {
        const socketEventImplementations = options.listenEvents(socket);
        for (const eventName in socketEventImplementations) {
          socket.on(
            eventName,
            // @ts-expect-error ?
            (...args: Parameters<Events[typeof eventName]>, callback) => {
              const output = socketEventImplementations[eventName](...args);
              callback(output);
            }
          );
        }
      }
    });
  },
  client: {
    namespaceEndpoint,
    emitEvents: options.listenEvents,
  },
});
