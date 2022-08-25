import bodyParser from "body-parser";
import { Handler, Request } from "express";

import { PrismaClient } from "../../../prisma/generated/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

const upsertAuthorUser = async (req: Request) => {
  const { personcode, notation } = req.body;
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  if (
    id &&
    !(await prisma.authorUser.count({
      where: {
        id,
        userId,
      },
    }))
  ) {
    return null;
  }
  if (
    !id &&
    (await prisma.authorUser.count({
      where: { userId },
    })) >= 5
  ) {
    throw new Error("429");
  }
  await prisma.authorUser.upsert({
    update: {
      notation,
    },
    create: {
      personcode,
      userId,
      notation: 5,
    },
    where: { id },
  });
};

export const get: Handler = async (req, res) => {
  const authorsUsers = await prisma.authorUser.findMany({
    where: { userId: req.user.id },
  });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(authorsUsers));
};

export const put = [
  parseForm,
  (async (req, res) => {
    try {
      await upsertAuthorUser(req);
      res.writeHead(200);
      res.end();
    } catch (e) {
      res.writeHead(parseInt(e as string));
      res.end();
    }
  }) as Handler,
];
