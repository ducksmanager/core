import PushNotifications from "@pusher/push-notifications-server";
import type { Namespace, Server } from "socket.io";

import type { issuePopularity } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { RequiredAuthMiddleware } from "../auth/util";
import issues from "./issues";
import marketplace from "./marketplace";
import options from "./options";
import purchases from "./purchases";
import subscriptions from "./subscriptions";
import type Events from "./types";
import { namespaceEndpoint } from "./types";
import user from "./user";
import { getUser } from "./user/util";
import watchedAuthors from "./watched-authors";

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>)
    .use(RequiredAuthMiddleware)
    .on("connection", (socket) => {
      console.log(`User ${socket.data.user!.username} connected to collection`);
      watchedAuthors(socket);
      user(socket);
      issues(socket);
      marketplace(socket);
      options(socket);
      purchases(socket);
      subscriptions(socket);

      socket.on("emptyCollection", (callback) =>
        prismaDm.issue
          .deleteMany({
            where: { userId: socket.data.user!.id },
          })
          .finally(() => {
            callback();
          }),
      );

      socket.on("getUserPermissions", (callback) =>
        prismaDm.userPermission
          .findMany({
            where: {
              username: socket.data.user!.username,
            },
          })
          .then(callback),
      );

      socket.on("getCollectionPopularity", (callback) =>
        prismaDm.$queryRaw<issuePopularity[]>`
      select issuePopularity.issuecode,
             issuePopularity.popularite AS popularity
      from numeros_popularite issuePopularity
             inner join numeros issue using (issuecode)
      where ID_Utilisateur = ${socket.data.user!.id}
      order by popularity DESC`.then(callback),
      );

      socket.on("getNotificationToken", async (username, callback) => {
        if (username !== socket.data.user!.username) {
          callback({ error: "Unauthorized" });
        } else {
          try {
            callback(
              new PushNotifications({
                instanceId: process.env.PUSHER_INSTANCE_ID || "",
                secretKey: process.env.PUSHER_SECRET_KEY || "",
              }).generateToken(socket.data.user!.username).token,
            );
          } catch (e) {
            console.error(e);
            callback({ error: "Error", errorDetails: (e as Error).message });
          }
        }
      });

      socket.on("getLastVisit", async (callback) => {
        let user: Awaited<ReturnType<typeof getUser>>;
        try {
          user = await getUser(socket.data.user!.id);
        } catch (_e) {
          callback({ error: "This user does not exist" });
          return;
        }
        if (!user.lastAccess) {
          console.log(
            `Initializing last access for user ${socket.data.user!.id}`,
          );
          user.previousAccess = null;
          user.lastAccess = new Date();
        } else {
          console.log(`Updating last access for user ${socket.data.user!.id}`);
          user.previousAccess = user.lastAccess;
          user.lastAccess = new Date();
        }
        prismaDm.user.update({
          data: user,
          where: {
            id: socket.data.user!.id,
          },
        });

        callback(user.previousAccess?.toISOString() || null);
      });

      socket.on("getLastPublishedEdges", async (callback) => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const userIssues = (
          await prismaDm.issue.findMany({
            where: {
              userId: socket.data.user!.id,
            },
            select: {
              issuecode: true,
            },
          })
        ).map(
          (issue) => `${issue.issuecode}`,
        ) as string[];
        callback(
          (
            await prismaDm.edge.findMany({
              where: {
                creationDate: {
                  gt: threeMonthsAgo,
                },
                issuecode: {
                  in: userIssues,
                },
              },
              take: 5,
            })
          ).map((edge) => ({
            ...edge,
            creationDate: edge.creationDate.toISOString(),
          })),
        );
      });
    });
};
