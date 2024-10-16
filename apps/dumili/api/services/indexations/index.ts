import type { Server } from "socket.io";

import type { NamespaceWithData, SessionData } from "~/index";
import { prisma } from "~/index";

import { RequiredAuthMiddleware } from "../_auth";
import Events from "./types";

const getIndexationsWithFirstPage = (userId: number) =>
  prisma.indexation.findMany({
    where: {
      dmUserId: userId,
    },
    include: {
      pages: {
        take: 1,
        orderBy: {
          pageNumber: "asc",
        },
      },
    },
  });

export default (io: Server) => {
  io.use(RequiredAuthMiddleware);

  (io.of(Events.namespaceEndpoint) as NamespaceWithData<Events, SessionData>)
    .use(RequiredAuthMiddleware)
    .on("connection", async (socket) => {
      socket.on("createIfNotExists", async (id, callback) => {
        prisma.indexation
          .upsert({
            create: {
              id,
              dmUserId: socket.data.user.id,
            },
            update: {},
            where: {
              id,
            },
          })
          .then(callback);
      });
      socket.on("getIndexations", async (callback) => {
        callback({
          indexations: await getIndexationsWithFirstPage(socket.data.user.id),
        });
      });
    });
};
