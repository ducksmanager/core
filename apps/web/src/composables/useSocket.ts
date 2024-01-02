import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { AllButLast } from "socket.io-client/build/esm/socket";

import { EventReturnTypeIncludingError } from "~services/types";

interface EventsMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [event: string]: any;
}

export default <Services extends EventsMap>(namespaceName: string) => {
  const socket = io(import.meta.env.VITE_SOCKET_URL + namespaceName, {
    auth: (cb) => {
      cb({
        token: Cookies.get("token"),
      });
    },
  });
  type StringKeyOf<T> = keyof T & string;

  type EventCalls<S extends Services> = {
    [EventName in StringKeyOf<S>]: (
      ...args: AllButLast<Parameters<S[EventName]>>
    ) => Promise<EventReturnTypeIncludingError<S[EventName]>>;
  };

  return new Proxy<EventCalls<Services>>({} as EventCalls<Services>, {
    get:
      <EventName extends StringKeyOf<Services>>(_: never, event: EventName) =>
      (
        ...args: AllButLast<Parameters<Services[EventName]>>
      ): Promise<EventReturnTypeIncludingError<Services[EventName]>> =>
        socket.emitWithAck(event, ...args),
  });
};
