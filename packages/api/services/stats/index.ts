import jwt from "jsonwebtoken";
import { Namespace, Server } from "socket.io";

import { User } from "~dm-types/SessionUser";

import suggestions from "./suggestions";
import { StatsServices } from "./types";
import watchedAuthors from "./watchedAuthors";

export default (io: Server) => {
  (
    io.of("/stats") as Namespace<
      StatsServices,
      Record<string, never>,
      Record<string, never>,
      { user?: User }
    >
  )
    .use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (token == null) {
        next(new Error("No token provided"));
        return;
      }

      jwt.verify(
        token,
        process.env.TOKEN_SECRET as string,
        (err: unknown, user: unknown) => {
          if (err) {
            next(new Error("Invalid token: " + err));
            return;
          }
          socket.data.user = user as User;
          next();
        },
      );
    })
    .on("connection", (socket) => {
      suggestions(socket);
      watchedAuthors(socket);
    });
};
