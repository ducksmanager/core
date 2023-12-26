import { Server } from "socket.io";

import { RequiredAuthMiddleware } from "../auth/util";
import suggestions from "./suggestions";
import { Namespace } from "./types";
import watchedAuthors from "./watchedAuthors";

export default (io: Server) => {
  (io.of("/stats") as Namespace)
    .use(RequiredAuthMiddleware)
    .on("connection", (socket) => {
      suggestions(socket);
      watchedAuthors(socket);
    });
}; 
