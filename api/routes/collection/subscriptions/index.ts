import bodyParser from "body-parser";
import { Handler, Request, Response } from "express";

import { PrismaClient, subscription } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

async function upsertSubscription(req: Request) {
  const publicationCodeParts = req.body.publicationcode.split("/");
  const dates = {
    startDate: new Date(Date.parse(req.body.startDate)),
    endDate: new Date(Date.parse(req.body.endDate)),
  };
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  if (
    id &&
    !(await prisma.subscription.count({
      where: {
        id,
        users: {
          id: userId,
        },
      },
    }))
  ) {
    return null;
  }
  await prisma.subscription.upsert({
    update: dates,
    create: {
      country: publicationCodeParts[0],
      magazine: publicationCodeParts[1],
      users: {
        connect: { id: userId },
      },
      ...dates,
    },
    where: {
      id,
    },
  });
}

export type getType = (Omit<subscription, "startDate" | "endDate"> & {
  publicationcode: string;
  startDate: string;
  endDate: string;
})[];
export const get: Handler = async (req, res: Response<getType>) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      users: {
        id: req.user.id,
      },
    },
  });
  return res.json(
    subscriptions.map((subscription: subscription) => ({
      ...subscription,
      publicationcode: `${subscription.country}/${subscription.magazine}`,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
    }))
  );
};

export type putType = string;
export const put = [
  parseForm,
  (async (req, res: Response<putType>) => {
    await upsertSubscription(req);
    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  }) as Handler,
];
