import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";
import { EditSubscription } from "~types/EditSubscription";

import { upsertSubscription } from "./index";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export type postCall = Call<
  undefined,
  { id: string },
  { subscription: EditSubscription }
>;
export const post = [
  parseForm,
  async (...[req, res]: ExpressCall<postCall>) => {
    await upsertSubscription(
      req.params.id,
      req.body.subscription,
      req.user!.id
    );
    res.writeHead(200, { "Content-Type": "application/text" });
    res.end();
  },
];

export type deleteCall = Call<undefined, { id: number }>;
export const del = [
  parseForm,
  async (...[req, res]: ExpressCall<deleteCall>) => {
    await prisma.subscription.deleteMany({
      where: {
        id: req.params.id || -1,
        users: {
          id: req.user!.id,
        },
      },
    });
    res.writeHead(204);
    res.end();
  },
];
