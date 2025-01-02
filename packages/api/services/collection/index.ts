import PushNotifications from "@pusher/push-notifications-server";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import issues from "./issues";
import marketplace from "./marketplace";
import options from "./options";
import purchases from "./purchases";
import subscriptions from "./subscriptions";
import user from "./user";
import { getUser } from "./user/util";
import watchedAuthors from "./watched-authors";
import { UserSocket } from "~/index";
import { useSocketServices } from "~socket.io-services";
import { SessionUser } from "~dm-types/SessionUser";
import { RequiredAuthMiddleware } from "../auth/util";

const listenEvents = (socket: UserSocket) => ({
  ...watchedAuthors(socket),
  ...user(socket),
  ...issues(socket),
  ...marketplace(socket),
  ...options(socket),
  ...purchases(socket),
  ...subscriptions(socket),

  emptyCollection: () =>
    prismaDm.issue
      .deleteMany({
        where: { userId: socket.data.user!.id },
      })
      .finally(() => {}),

  getUserPermissions: () =>
    prismaDm.userPermission.findMany({
      where: {
        username: socket.data.user!.username,
      },
    }),

  getCollectionPopularity: () =>
    prismaDm.$queryRaw<{ issuecode: string; popularity: number }[]>`
      select userIssue.issuecode, COUNT(issue.ID) AS popularity
      from numeros userIssue
              inner join numeros issue using (issuecode)
      where issue.ID_Utilisateur = ${socket.data.user!.id}
      group by issuecode
      order by COUNT(issue.ID) DESC`.then((results) =>
      results.groupBy("issuecode", "popularity"),
    ),

  getNotificationToken: async (username: string) => {
    if (username !== socket.data.user!.username) {
      return { error: "Unauthorized" };
    } else {
      try {
        return new PushNotifications({
          instanceId: process.env.PUSHER_INSTANCE_ID || "",
          secretKey: process.env.PUSHER_SECRET_KEY || "",
        }).generateToken(socket.data.user!.username).token;
      } catch (e) {
        console.error(e);
        return { error: "Error", errorDetails: (e as Error).message };
      }
    }
  },

  getLastVisit: async () => {
    let user: Awaited<ReturnType<typeof getUser>>;
    try {
      user = await getUser(socket.data.user!.id);
    } catch (_e) {
      return { error: "This user does not exist" };
    }
    if (!user.lastAccess) {
      console.log(`Initializing last access for user ${socket.data.user!.id}`);
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

    return user.previousAccess?.toISOString() || null;
  },

  getLastPublishedEdges: async () => {
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
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { user: SessionUser }
>("/collection", {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
