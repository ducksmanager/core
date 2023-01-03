import bodyParser from "body-parser";
import { Handler, Request, Response } from "express";

import { PrismaClient, subscription } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";
import { EditSubscription } from "~types/EditSubscription";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

async function upsertSubscription(req: Request) {
  const subscription = req.body.subscription as EditSubscription;
  const publicationCodeParts = subscription.publicationcode!.split("/");

  const id = parseInt(req.params.id) || 0;
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
    update: {
      startDate: subscription.startDate!,
      endDate: subscription.endDate!,
    },
    create: {
      country: publicationCodeParts[0],
      magazine: publicationCodeParts[1],
      users: {
        connect: { id: userId },
      },
      startDate: subscription.startDate!,
      endDate: subscription.endDate!,
    },
    where: {
      id,
    },
  });
}

export type getCall = Call<
  (Omit<subscription, "startDate" | "endDate"> & {
    publicationcode: string;
    startDate: string;
    endDate: string;
  })[]
>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
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
