import type { Namespace, Server } from "socket.io";

import { RequiredAuthMiddleware } from "../auth/util";
import suggestions from "./suggestions";
import Events from "./types";
import watchedAuthors from "./watchedAuthors";

export default (io: Server) => {
  (io.of(Events.namespaceEndpoint) as Namespace<Events>)
    .use(RequiredAuthMiddleware)
    .on("connection", (socket) => {
      suggestions(socket);
      watchedAuthors(socket);
    });
};
