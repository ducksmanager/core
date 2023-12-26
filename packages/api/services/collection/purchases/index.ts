import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import { purchase } from "~prisma-clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

import { getUserPurchase } from "../issues/util";
import { Socket } from "../types";

const parseForm = bodyParser.json();


export default (socket: Socket) => {
  socket.on('getPurchases', async (callback) => prismaDm.purchase.findMany({
    where: {
      userId: socket.data.user!.id,
    },
    orderBy: {
      date: "desc",
    },
  }).then(data => callback(
    data.map((purchase) => ({
      ...purchase,
      date: purchase.date.toISOString().split("T")[0]
    })))
  ));

  socket.on('createPurchase', async (date, description, callback) => {
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

  socket.on('deletePurchase', async (purchaseId, callback) => {
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

    callback()
  })
}

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: (Omit<purchase, "date"> & {
      date: string;
    })[];
  }>
) => {
  return res.json(
    (
      await prismaDm.purchase.findMany({
        where: {
          userId: req.user!.id,
        },
        orderBy: {
          date: "desc",
        },
      })
    ).map((purchase) => ({
      ...purchase,
      date: purchase.date.toISOString().split("T")[0],
    }))
  );
};

export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      reqBody: { date: string; description: string };
    }>
  ) => {
    const { date, description } = req.body;

    const criteria = {
      userId: req.user!.id,
      date: new Date(date),
      description,
    };
    if (
      (await prismaDm.purchase.count({
        where: criteria,
      })) > 0
    ) {
      res.writeHead(409);
      res.end();
      return;
    }

    await prismaDm.purchase.create({
      data: criteria,
    });

    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  },
];
