import {  Server } from "socket.io";

import { AuthMiddleware } from "../auth/util";
import suggestions from "./suggestions";
import { Namespace } from "./types";
import watchedAuthors from "./watchedAuthors";

export default (io: Server) => {
  (io.of("/stats") as Namespace)
    .use(AuthMiddleware)
    .on("connection", (socket) => {
      suggestions(socket);
      watchedAuthors(socket);
    });
};
