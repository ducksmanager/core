import { Namespace, Server } from "socket.io";

import Events from './types'

export default (io: Server) => {
  const namespace = io.of(Events.namespaceEndpoint) as Namespace<Events>;
  namespace.on("connection", (socket) => {
    socket.on("getUser", async (callback) => callback({ username: socket.data.user.username }));
  });
};
