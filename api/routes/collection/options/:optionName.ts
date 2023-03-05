import bodyParser from "body-parser";

import { PrismaClient, userOptionType } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export const optionNameToEnum = (
  optionName: string | null
): userOptionType | null => {
  switch (optionName) {
    case "suggestion_notification_country":
    case "sales_notification_publications":
    case "marketplace_contact_methods":
      return userOptionType[optionName];
    default:
      return null;
  }
};

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: string[];
    params: { optionName: userOptionType };
  }>
) => {
  const optionName = optionNameToEnum(req.params.optionName);
  if (!optionName) {
    res.writeHead(400);
    res.end();
  } else {
    return res.json(
      (
        await prisma.userOption.findMany({
          where: {
            userId: req.user!.id,
            optionName,
          },
        })
      ).map((option) => option.optionValue)
    );
  }
};

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      params: { optionName: string };
      reqBody: { values: string[] };
    }>
  ) => {
    const optionName = optionNameToEnum(req.params.optionName);
    if (!optionName) {
      res.writeHead(400);
      res.end();
    } else {
      const values = req.body.values;
      const userId = req.user!.id;
      await prisma.userOption.deleteMany({
        where: {
          userId,
          optionName,
        },
      });

      await prisma.$transaction(
        values.map((optionValue: string) =>
          prisma.userOption.create({
            data: {
              optionName,
              optionValue,
              userId,
            },
          })
        )
      );

      res.writeHead(200, { "Content-Type": "application/text" });
      res.end();
    }
  },
];
