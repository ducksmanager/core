import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";
import { EditSubscription } from "~dm-types/EditSubscription";

import { upsertSubscription } from "./index";

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
    await prismaDm.subscription.deleteMany({
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
