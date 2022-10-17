import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      (
        await prisma.purchase.findMany({
          where: {
            userId: req.user.id,
          },
          orderBy: {
            date: "desc",
          },
        })
      ).map((purchase) => ({
        ...purchase,
        date: purchase.date.toISOString().split("T")[0],
      }))
    )
  );
};

export const put = [
  parseForm,
  (async (req, res) => {
    const { date, description } = req.body;

    const criteria = {
      userId: req.user.id,
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

    res.writeHead(200);
    res.end();
  }) as Handler,
];
