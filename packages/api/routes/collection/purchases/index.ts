import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import { purchase } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();

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
