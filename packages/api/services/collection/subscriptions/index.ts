import type { EditSubscription } from "~dm-types/EditSubscription";
import type { subscription } from "~prisma-schemas/client_dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserSocket } from "../../../index";

export type SubscriptionTransformedStringDates = Omit<
  subscription,
  "startDate" | "endDate"
> & {
  startDate: string;
  endDate: string;
};

export default (socket: UserSocket) => ({
  getSubscriptions: () =>
    prismaDm.subscription
      .findMany({
        where: {
          users: {
            id: socket.data.user!.id,
          },
        },
      })
      .then((data) =>
        data.map((subscription) => ({
          ...subscription,
          startDate: subscription.startDate.toISOString(),
          endDate: subscription.endDate.toISOString(),
        })),
      ),

  createSubscription: async (subscription: EditSubscription) => {
    await upsertSubscription(null, subscription, socket.data.user!.id);
  },

  updateSubscription: async (
    id: number,
    subscription: SubscriptionTransformedStringDates,
  ) => {
    await upsertSubscription(id, subscription, socket.data.user!.id);
  },

  deleteSubscription: async (id: number) => {
    await prismaDm.subscription.deleteMany({
      where: {
        id,
        users: {
          id: socket.data.user!.id,
        },
      },
    });
  },
});

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

  const dates = {
    startDate: new Date(subscription.startDate),
    endDate: new Date(subscription.endDate),
  };
  await prismaDm.subscription.upsert({
    update: dates,
    create: {
      publicationcode: subscription.publicationcode!,
      users: {
        connect: { id: userId },
      },
      ...dates,
    },
    where: {
      id: id || 0,
    },
  });
}
