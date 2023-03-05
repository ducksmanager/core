import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { EditSubscription } from "~types/EditSubscription";

import { upsertSubscription } from "./index";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      params: { id: string };
      reqBody: { subscription: EditSubscription };
    }>
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

export const del = [
  parseForm,
  async (...[req, res]: ExpressCall<{ params: { id: string } }>) => {
    await prisma.subscription.deleteMany({
      where: {
        id: parseInt(req.params.id) || -1,
        users: {
          id: req.user!.id,
        },
      },
    });
    res.writeHead(204);
    res.end();
  },
];
