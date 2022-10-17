import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

import { getUserPurchase } from "../issues";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export const del = [
  parseForm,
  (async (req, res) => {
    const criteria = {
      userId: req.user.id,
      id: parseInt(req.params.id),
    };
    const purchase = await getUserPurchase(criteria.userId, criteria.id);
    if (!purchase) {
      res.writeHead(404);
      res.end();
      return;
    }
    await prisma.purchase.deleteMany({
      where: criteria,
    });

    res.writeHead(200);
    res.end();
  }) as Handler,
];
