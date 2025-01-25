import PushNotifications from "@pusher/push-notifications-server";
import { useSocketEvents } from "socket-call-server";

import type { SessionUser } from "~dm-types/SessionUser";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../index";
import { RequiredAuthMiddleware } from "../auth/util";
import namespaces from "../namespaces";
import issues from "./issues";
import marketplace from "./marketplace";
import options from "./options";
import purchases from "./purchases";
import subscriptions from "./subscriptions";
import user from "./user";
import { getUser } from "./user/util";
import watchedAuthors from "./watched-authors";

const listenEvents = (services: UserServices) => {
  const { _socket } = services;
  return {
    ...watchedAuthors(services),
    ...user(services),
    ...issues(services),
    ...marketplace(services),
    ...options(services),
    ...purchases(services),
    ...subscriptions(services),

    emptyCollection: () =>
      prismaDm.issue
        .deleteMany({
          where: { userId: _socket.data.user!.id },
        })
        .finally(() => {}),

    getUserPermissions: () =>
      prismaDm.userPermission.findMany({
        where: {
          username: _socket.data.user!.username,
        },
      }),

    getCollectionPopularity: () =>
      prismaDm.$queryRaw<{ issuecode: string; popularity: number }[]>`
      select userIssue.issuecode, COUNT(issue.ID) AS popularity
      from numeros userIssue
              inner join numeros issue using (issuecode)
      where issue.ID_Utilisateur = ${_socket.data.user!.id}
      group by issuecode
      order by COUNT(issue.ID) DESC`.then((results) =>
        results.groupBy("issuecode", "popularity"),
      ),

    getNotificationToken: async (username: string) => {
      if (username !== _socket.data.user!.username) {
        return { error: "Unauthorized" };
      } else {
        try {
          return new PushNotifications({
            instanceId: process.env.PUSHER_INSTANCE_ID || "",
            secretKey: process.env.PUSHER_SECRET_KEY || "",
          }).generateToken(_socket.data.user!.username).token;
        } catch (e) {
          console.error(e);
          return { error: "Error", errorDetails: (e as Error).message };
        }
      }
    },

    getLastVisit: async () => {
      let user: Awaited<ReturnType<typeof getUser>>;
      try {
        user = await getUser(_socket.data.user!.id);
      } catch (_e) {
        return { error: "This user does not exist" };
      }
      if (!user.lastAccess) {
        console.log(
          `Initializing last access for user ${_socket.data.user!.id}`,
        );
        user.previousAccess = null;
        user.lastAccess = new Date();
      } else {
        console.log(`Updating last access for user ${_socket.data.user!.id}`);
        user.previousAccess = user.lastAccess;
        user.lastAccess = new Date();
      }
      prismaDm.user.update({
        data: user,
        where: {
          id: _socket.data.user!.id,
        },
      });

      return user.previousAccess?.toISOString() || null;
    },

    getLastPublishedEdges: async () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const userIssues = (
        await prismaDm.issue.findMany({
          where: {
            userId: _socket.data.user!.id,
          },
          select: {
            issuecode: true,
          },
        })
      ).map((issue) => `${issue.issuecode}`) as string[];
      return (
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
      }));
    },
  };
};

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>,
  Record<string, never>,
  { user: SessionUser }
>(namespaces.COLLECTION, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
