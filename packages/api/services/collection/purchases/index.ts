import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import type { UserServices } from "../../../index";
import { getUserPurchase } from "../issues/util";

export default ({_socket}: UserServices) => ({
  getPurchases: () =>
    prismaDm.purchase
      .findMany({
        where: {
          userId: _socket.data.user!.id,
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

  createPurchase: async (date: string, description: string) => {
    const criteria = {
      userId: _socket.data.user!.id,
      date: new Date(date),
      description,
    };
    if (
      (await prismaDm.purchase.count({
        where: criteria,
      })) > 0
    ) {
      return { error: "Purchase already exists" };
    }

    await prismaDm.purchase.create({
      data: criteria,
    });
  },

  deletePurchase: async (purchaseId: number) => {
    const criteria = {
      userId: _socket.data.user!.id,
      id: purchaseId,
    };
    const purchase = await getUserPurchase(criteria.userId, criteria.id);
    if (!purchase) {
      return { error: "Purchase not found" };
    }
    await prismaDm.purchase.deleteMany({
      where: criteria,
    });
  },
});
