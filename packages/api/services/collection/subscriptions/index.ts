import type { EditSubscription } from "~dm-types/EditSubscription";
import type { subscription } from "~prisma-schemas/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../../index";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

export type SubscriptionTransformedStringDates = Omit<
  subscription,
  "startDate" | "endDate"
> & {
  startDate: string;
  endDate: string;
};

export default ({ _socket }: UserServices) => ({
  getSubscriptions: () =>
    prismaDm.subscription
      .findMany({
        where: {
          users: {
            id: _socket.data.user.id,
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

  createSubscription: ev(
    v.object({
      publicationcode: v.string(),
      startDate: v.string(),
      endDate: v.string(),
    }),
  )(async (subscription) => {
    await upsertSubscription(null, subscription, _socket.data.user.id);
  }),

  updateSubscription: ev(
    v.number(),
    v.object({
      id: v.number(),
      publicationcode: v.string(),
      startDate: v.string(),
      endDate: v.string(),
    }),
  )(async (id, subscription) => {
    await upsertSubscription(id, subscription, _socket.data.user.id);
  }),

  deleteSubscription: ev(v.number())(async (id) => {
    await prismaDm.subscription.deleteMany({
      where: {
        id,
        users: {
          id: _socket.data.user.id,
        },
      },
    });
  }),
});

export async function upsertSubscription(
  id: number | null,
  subscription: EditSubscription,
  userId: number,
) {
  if (!subscription.publicationcode) {
    return null;
  }

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
      publicationcode: subscription.publicationcode,
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
