import type { Socket } from "socket.io";

import { prismaDm } from "~/prisma";

import { getUserPurchase } from "../issues/util";
import type Events from "../types";

export default (socket: Socket<Events>) => {
  socket.on("getPurchases", (callback) =>
    prismaDm.purchase
      .findMany({
        where: {
          userId: socket.data.user!.id,
        },
        orderBy: {
          date: "desc",
        },
      })
      .then((data) =>
        callback(
          data.map((purchase) => ({
            ...purchase,
            date: purchase.date.toISOString().split("T")[0],
          })),
        ),
      ),
  );

  socket.on("createPurchase", async (date, description, callback) => {
    const criteria = {
      userId: socket.data.user!.id,
      date: new Date(date),
      description,
    };
    if (
      (await prismaDm.purchase.count({
        where: criteria,
      })) > 0
    ) {
      callback({ error: "Purchase already exists" });
    }

    await prismaDm.purchase.create({
      data: criteria,
    });
  });

  socket.on("deletePurchase", async (purchaseId, callback) => {
    const criteria = {
      userId: socket.data.user!.id,
      id: purchaseId,
    };
    const purchase = await getUserPurchase(criteria.userId, criteria.id);
    if (!purchase) {
      callback({ error: "Purchase not found" });
      return;
    }
    await prismaDm.purchase.deleteMany({
      where: criteria,
    });

    callback();
  });
};
