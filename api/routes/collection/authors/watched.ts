import bodyParser from "body-parser";
import { Handler, Request } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

const maxWatchedAuthors = 5;

const upsertAuthorUser = async (req: Request) => {
  const { personcode, notation } = req.body;
  const userId = req.user.id;
  const criteria = {
    personcode,
    userId,
  };
  const existingAuthorUser = await prisma.authorUser.findFirst({
    where: criteria,
  });
  if (existingAuthorUser) {
    if (
      (await prisma.authorUser.count({
        where: { userId },
      })) >= maxWatchedAuthors
    ) {
      throw new Error("429");
    }
    await prisma.authorUser.update({
      data: { notation },
      where: { id: existingAuthorUser?.id },
    });
  } else {
    await prisma.authorUser.create({
      data: {
        ...criteria,
        notation: 5,
      },
    });
  }
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
      console.log(e);
      res.writeHead(parseInt(e as string));
      res.end();
    }
  }) as Handler,
];

export const post = [
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

export const del = [
  parseForm,
  (async (req, res) => {
    const { personcode } = req.body;
    if (!personcode) {
      res.writeHead(400);
      res.end();
      return;
    }
    await prisma.authorUser.deleteMany({
      where: {
        personcode,
        userId: req.user.id,
      },
    });
    res.writeHead(204);
    res.end();
  }) as Handler,
];
