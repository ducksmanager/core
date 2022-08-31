import bodyParser from "body-parser";
import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

const optionName = "suggestion_notification_country";

export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify(
      (
        await prisma.userOption.findMany({
          where: {
            userId: req.user.id,
            optionName,
          },
        })
      ).map((option) => option.optionValue)
    )
  );
};

export const post = [
  parseForm,
  (async (req, res) => {
    const countries = req.body.countries;
    const userId = req.user.id;
    await prisma.userOption.deleteMany({
      where: {
        userId,
        optionName,
      },
    });

    await prisma.$transaction(
      countries.map((publicationcode: string) =>
        prisma.userOption.create({
          data: {
            optionName,
            optionValue: publicationcode,
            userId,
          },
        })
      )
    );
  }) as Handler,
];
