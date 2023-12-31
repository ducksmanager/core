import Cookies from "js-cookie";
import { io, Socket } from "socket.io-client";

interface EventsMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [event: string]: any;
}

export default <Services extends EventsMap>(
  namespaceName: string,
): Socket<Services> =>
  io(import.meta.env.VITE_SOCKET_URL + namespaceName, {
    auth: (cb) => {
      cb({
        token: Cookies.get("token"),
      });
    },
  });
