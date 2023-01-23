import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

import { getUserPurchase } from "../issues/_common";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export type deleteCall = Call<undefined, { id: number }>;
export const del = [
  parseForm,
  async (...[req, res]: ExpressCall<deleteCall>) => {
    const criteria = {
      userId: req.user!.id,
      id: req.params.id,
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

    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  },
];
