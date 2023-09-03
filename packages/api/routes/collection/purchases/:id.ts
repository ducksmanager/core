import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

import { getUserPurchase } from "../issues/_common";

const parseForm = bodyParser.json();

export const del = [
  parseForm,
  async (...[req, res]: ExpressCall<{ params: { id: string } }>) => {
    const criteria = {
      userId: req.user!.id,
      id: parseInt(req.params.id),
    };
    const purchase = await getUserPurchase(criteria.userId, criteria.id);
    if (!purchase) {
      res.writeHead(404);
      res.end();
      return;
    }
    await prismaDm.purchase.deleteMany({
      where: criteria,
    });

    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  },
];
