import bodyParser from "body-parser";

import { PrismaClient, purchase } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export type getCall = Call<
  (Omit<purchase, "date"> & {
    date: string;
  })[]
>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
  return res.json(
    (
      await prisma.purchase.findMany({
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

export type putCall = Call<
  undefined,
  undefined,
  { date: string; description: string }
>;
export const put = [
  parseForm,
  async (...[req, res]: ExpressCall<putCall>) => {
    const { date, description } = req.body;

    const criteria = {
      userId: req.user!.id,
      date: new Date(date),
      description,
    };
    if (
      (await prisma.purchase.count({
        where: criteria,
      })) > 0
    ) {
      res.writeHead(409);
      res.end();
      return;
    }

    await prisma.purchase.create({
      data: criteria,
    });

    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  },
];
