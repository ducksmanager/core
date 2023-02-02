import bodyParser from "body-parser";

import { authorUser, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

const maxWatchedAuthors = 5;

const upsertAuthorUser = async (
  personcode: string,
  userId: number,
  notation?: number
) => {
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

export const get = async (...[req, res]: ExpressCall<authorUser[]>) => {
  const authorsUsers = await prisma.authorUser.findMany({
    where: { userId: req.user!.id },
  });
  return res.json(authorsUsers);
};

export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<undefined, undefined, { personcode: string }>
  ) => {
    try {
      await upsertAuthorUser(req.body.personcode, req.user!.id);
      res.writeHead(200, { "Content-Type": "application/text" });
      res.end();
    } catch (e) {
      console.log(e);
      res.writeHead(parseInt((e as Error)?.message as string) || 500);
      res.end();
    }
  },
];

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<
      undefined,
      undefined,
      { personcode: string; notation: number }
    >
  ) => {
    try {
      await upsertAuthorUser(
        req.body.personcode,
        req.user!.id,
        req.body.notation
      );
      res.writeHead(200, { "Content-Type": "application/text" });
      res.end();
    } catch (e) {
      console.error(e);
      res.writeHead(parseInt((e as Error)?.message as string) || 500);
      res.end();
    }
  },
];

export const del = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<undefined, undefined, { personcode: string }>
  ) => {
    const { personcode } = req.body;
    if (!personcode) {
      res.writeHead(400);
      res.end();
      return;
    }
    await prisma.authorUser.deleteMany({
      where: {
        personcode,
        userId: req.user!.id,
      },
    });
    res.writeHead(204);
    res.end();
  },
];
