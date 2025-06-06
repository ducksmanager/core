import type { Server as HttpdServer } from "http";
import { Server } from "socket.io";

import type { SessionUser } from "~dm-types/SessionUser";
import { instrument } from "@socket.io/admin-ui";

class ServerWithUser extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: SessionUser }
> {}

export default (port: number, httpServer?: HttpdServer) => {
  let io: ServerWithUser;
  if (httpServer) {
    httpServer.listen(port);
    io = new ServerWithUser(httpServer, {
      cors: {
        origin: true,
      },
    });
  } else {
    io = new ServerWithUser({
      cors: {
        origin: true,
      },
    });
  }

  instrument(io, {
    auth: false,
  });

  io.use((_socket, next) => {
    process.on("unhandledRejection", (reason: Error) => {
      console.error(reason);
      next(reason);
    });

    process.on("uncaughtException", (error: Error) => {
      console.error(error);
      next(error);
    });
    next();
  });

  if (!httpServer) {
    io.listen(port);
  }
  console.log(
    `WebSocket open on port ${port} on worker ${process.env.NODE_APP_INSTANCE}`,
  );

  return io;
};
