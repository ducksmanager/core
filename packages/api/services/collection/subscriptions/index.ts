import type { Socket } from "socket.io";

import type { EditSubscription } from "~dm-types/EditSubscription";
import { prismaClient as prismaDm } from "~prisma-clients/schemas/dm";

import type Events from "../types";
export default (socket: Socket<Events>) => {
  socket.on("getSubscriptions", (callback) =>
    prismaDm.subscription
      .findMany({
        where: {
          users: {
            id: socket.data.user!.id,
          },
        },
      })
      .then((data) =>
        callback(
          data.map((subscription) => ({
            ...subscription,
            startDate: subscription.startDate.toISOString(),
            endDate: subscription.endDate.toISOString(),
          })),
        ),
      ),
  );

  socket.on("createSubscription", async (subscription, callback) => {
    await upsertSubscription(null, subscription, socket.data.user!.id);
    callback();
  });

  socket.on("updateSubscription", async (id, subscription, callback) => {
    await upsertSubscription(id, subscription, socket.data.user!.id);
    callback();
  });

  socket.on("deleteSubscription", async (id, callback) => {
    await prismaDm.subscription.deleteMany({
      where: {
        id,
        users: {
          id: socket.data.user!.id,
        },
      },
    });
    callback();
  });
};

export async function upsertSubscription(
  id: number | null,
  subscription: EditSubscription,
  userId: number,
) {

  if (
    id &&
    !(await prismaDm.subscription.count({
      where: {
        id,
        users: {
          id: userId,
        },
      },
    }))
  ) {
    return null;
  }
  await prismaDm.subscription.upsert({
    update: {
      startDate: subscription.startDate!,
      endDate: subscription.endDate!,
    },
    create: {
      publicationcode: subscription.publicationcode!,
      users: {
        connect: { id: userId },
      },
      startDate: subscription.startDate!,
      endDate: subscription.endDate!,
    },
    where: {
      id: id!,
    },
  });
}
