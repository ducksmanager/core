import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import { authorUser } from "~prisma-clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

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
  const existingAuthorUser = await prismaDm.authorUser.findFirst({
    where: criteria,
  });
  if (existingAuthorUser) {
    await prismaDm.authorUser.update({
      data: { notation },
      where: { id: existingAuthorUser?.id },
    });
  } else {
    if (
      (await prismaDm.authorUser.count({
        where: { userId },
      })) >= maxWatchedAuthors
    ) {
      throw new Error("429");
    }
    await prismaDm.authorUser.create({
      data: {
        ...criteria,
        notation: 5,
      },
    });
  }
};

export const get = async (
  ...[req, res]: ExpressCall<{ resBody: authorUser[] }>
) => {
  const authorsUsers = await prismaDm.authorUser.findMany({
    where: { userId: req.user!.id },
  });
  return res.json(authorsUsers);
};

export const put = [
  parseForm,
  async (...[req, res]: ExpressCall<{ reqBody: { personcode: string } }>) => {
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
    ...[req, res]: ExpressCall<{
      reqBody: { personcode: string; notation: number };
    }>
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
  async (...[req, res]: ExpressCall<{ reqBody: { personcode: string } }>) => {
    const { personcode } = req.body;
    if (!personcode) {
      res.writeHead(400);
      res.end();
      return;
    }
    await prismaDm.authorUser.deleteMany({
      where: {
        personcode,
        userId: req.user!.id,
      },
    });
    res.writeHead(204);
    res.end();
  },
];
