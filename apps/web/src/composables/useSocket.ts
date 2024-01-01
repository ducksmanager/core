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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Event extends keyof Services>(
    event: Event,
    ...args: AllButLast<Parameters<Services[Event]>>
  ): Promise<EventReturnTypeIncludingError<Services[Event]>> =>
    socket.emitWithAck(event as string, ...args);
};
