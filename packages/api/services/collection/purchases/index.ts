import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../../index";
import { getUserPurchase } from "../issues/util";

import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

export default ({ _socket }: UserServices) => ({
  getPurchases: () =>
    prismaDm.purchase
      .findMany({
        where: {
          userId: _socket.data.user.id,
        },
        orderBy: {
          date: "desc",
        },
      })
      .then((data) =>
        data.map((purchase) => ({
          ...purchase,
          date: purchase.date.toISOString().split("T")[0],
        })),
      ),

  createPurchase: ev(
    v.string(),
    v.string(),
  )(async (date, description) => {
    const criteria = {
      userId: _socket.data.user.id,
      date: new Date(date),
      description,
    };
    if (Number.isNaN(criteria.date.getTime())) {
      return { error: `Invalid date: ${date}` } as const;
    }

    if (
      (await prismaDm.purchase.count({
        where: criteria,
      })) > 0
    ) {
      return { error: "Purchase already exists" } as const;
    }

    await prismaDm.purchase.create({
      data: criteria,
    });
  }),

  deletePurchase: ev(v.number())(async (purchaseId) => {
    const criteria = {
      userId: _socket.data.user.id,
      id: purchaseId,
    };
    const purchase = await getUserPurchase(criteria.id, criteria.userId);
    if (!purchase) {
      return { error: "Purchase not found" };
    }
    await prismaDm.purchase.deleteMany({
      where: criteria,
    });
  }),
});
