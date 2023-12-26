import { Server } from "socket.io";

import { prismaDm } from "~/prisma";

import { getHashedPassword, loginAs } from "../auth/util";
import { Namespace } from "./types";

export default (io: Server) => {
  (io.of(Namespace['endpoint']) as Namespace).on("connection", (socket) => {
    socket.on("getCsrf", async (callback) => callback(''));
    socket.on("login", async ({ username, password }, callback) => {
      const hashedPassword = getHashedPassword(password);
      const user = await prismaDm.user.findFirst({
        where: {
          username,
          password: hashedPassword,
        },
      });
      if (user) {
        const token = await loginAs(user, hashedPassword);

        callback(token);
      } else {
        callback({ error: 'Invalid username or password' });
      }
    })
  });
}