import bodyParser from "body-parser";
import { Handler, Request, Response } from "express";

import { authorUser, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

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
    await prisma.authorUser.update({
      data: { notation },
      where: { id: existingAuthorUser?.id },
    });
  } else {
    if (
      (await prisma.authorUser.count({
        where: { userId },
      })) >= maxWatchedAuthors
    ) {
      throw new Error("429");
    }
    await prisma.authorUser.create({
      data: {
        ...criteria,
        notation: 5,
      },
    });
  }
};

export type getCall = Call<authorUser[]>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
  const authorsUsers = await prisma.authorUser.findMany({
    where: { userId: req.user.id },
  });
  return res.json(authorsUsers);
};

export type putType = string;
export const put = [
  parseForm,
  (async (req, res: Response<putType>) => {
    try {
      await upsertAuthorUser(req);
      res.writeHead(200, { "Content-Type": "application/text" });
      res.end();
    } catch (e) {
      console.log(e);
      res.writeHead(parseInt((e as Error)?.message as string) || 500);
      res.end();
    }
  }) as Handler,
];

export type postType = string;
export const post = [
  parseForm,
  (async (req, res: Response<postType>) => {
    try {
      await upsertAuthorUser(req);
      res.writeHead(200, { "Content-Type": "application/text" });
      res.end();
    } catch (e) {
      console.error(e);
      res.writeHead(parseInt((e as Error)?.message as string) || 500);
      res.end();
    }
  }) as Handler,
];

export type deleteType = authorUser[];
export const del = [
  parseForm,
  (async (req, res: Response<deleteType>) => {
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
