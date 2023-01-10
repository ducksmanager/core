import bodyParser from "body-parser";

import { authorUser, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

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

export type getCall = Call<authorUser[]>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
  const authorsUsers = await prisma.authorUser.findMany({
    where: { userId: req.user.id },
  });
  return res.json(authorsUsers);
};

export type putCall = Call<undefined, undefined, { personcode: string }>;
export const put = [
  parseForm,
  async (...[req, res]: ExpressCall<putCall>) => {
    try {
      await upsertAuthorUser(req.body.personcode, req.user.id);
      res.writeHead(200, { "Content-Type": "application/text" });
      res.end();
    } catch (e) {
      console.log(e);
      res.writeHead(parseInt((e as Error)?.message as string) || 500);
      res.end();
    }
  },
];

export type postCall = Call<
  undefined,
  undefined,
  { personcode: string; notation: number }
>;
export const post = [
  parseForm,
  async (...[req, res]: ExpressCall<postCall>) => {
    try {
      await upsertAuthorUser(
        req.body.personcode,
        req.user.id,
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

export type deleteCall = Call<undefined, undefined, authorUser>;
export const del = [
  parseForm,
  async (...[req, res]: ExpressCall<deleteCall>) => {
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
  },
];
