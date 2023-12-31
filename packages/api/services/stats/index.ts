import { Namespace, Server } from "socket.io";

import { RequiredAuthMiddleware } from "../auth/util";
import suggestions from "./suggestions";
import { Services } from "./types";
import watchedAuthors from "./watchedAuthors";

export default (io: Server) => {
  (io.of("/stats") as Namespace<Services>)
    .use(RequiredAuthMiddleware)
    .on("connection", (socket) => {
      suggestions(socket);
      watchedAuthors(socket);
    });
};
