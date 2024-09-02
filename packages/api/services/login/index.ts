import type { Namespace, Server } from "socket.io";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { getHashedPassword, loginAs } from "../auth/util";
import type Events from "./types";
import { namespaceEndpoint } from "./types";

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to login");

    socket.on("getCsrf", (callback) => callback(""));
    socket.on("login", async ({ username, password }, callback) => {
      console.log("login");
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
        callback({ error: "Invalid username or password" });
      }
    });

    socket.on("loginAsDemo", async (callback) => {
      const demoUser = await prismaDm.user.findFirst({
        where: { username: "demo" },
      });
      if (!demoUser) {
        callback({ error: "No demo user found" });
      } else {
        const token = await loginAs(
          demoUser,
          getHashedPassword(demoUser!.password),
        );

        callback({ token });
      }
    });
  });
};
