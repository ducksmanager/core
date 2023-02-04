import bodyParser from "body-parser";

import { subscription } from "~prisma_clients/client_dm";
import prisma from "~prisma_extended_clients/dm.extends";
import { ExpressCall } from "~routes/_express-call";
import { EditSubscription } from "~types/EditSubscription";

const parseForm = bodyParser.json();

export async function upsertSubscription(
  idString: string,
  subscription: EditSubscription,
  userId: number
) {
  const publicationCodeParts = subscription.publicationcode!.split("/");

  const id = parseInt(idString) || 0;
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

export const get = async (
  ...[req, res]: ExpressCall<
    (Omit<subscription, "startDate" | "endDate"> & {
      publicationcode: string;
      startDate: string;
      endDate: string;
    })[]
  >
) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      users: {
        id: req.user!.id,
      },
    },
  });
  return res.json(
    subscriptions.map((subscription) => ({
      ...subscription,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
    }))
  );
};

export const put = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<
      undefined,
      { id: string },
      { subscription: EditSubscription }
    >
  ) => {
    await upsertSubscription(
      req.params.id,
      req.body.subscription,
      req.user!.id
    );
    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  },
];
