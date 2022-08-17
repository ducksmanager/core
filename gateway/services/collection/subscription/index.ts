import bodyParser from "body-parser";
import { Express, Request } from "express";

import { abonnements, PrismaClient } from "../../../prisma/generated/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

async function upsertSubscription(req: Request) {
  const publicationCodeParts = req.body.publicationCode.split("/");
  const dates = {
    startDate: new Date(Date.parse(req.body.startDate)),
    endDate: new Date(Date.parse(req.body.endDate)),
  };
  const id = parseInt(req.params.id);
  if (!id) {
    return null;
  }
  await prisma.abonnements.upsert({
    update: dates,
    create: {
      country: publicationCodeParts[0],
      magazine: publicationCodeParts[1],
      users: {
        connect: { id: req.user.id },
      },
      ...dates,
    },
    where: {
      id,
    },
  });
}

export default {
  addRoutes: (app: Express) => {
    app.post(
      "/api/collection/subscriptions/:id",
      parseForm,
      async (req, res) => {
        await upsertSubscription(req);
        res.writeHead(200);
        res.end();
      }
    );
    app.put("/api/collection/subscriptions", parseForm, async (req, res) => {
      await upsertSubscription(req);
      res.writeHead(200);
      res.end();
    });
    app.delete(
      "/api/collection/subscriptions/:id",
      parseForm,
      async (req, res) => {
        await prisma.abonnements.deleteMany({
          where: {
            id: parseInt(req.params.id) || -1,
            users: {
              id: req.user.id,
            },
          },
        });
        res.writeHead(204);
        res.end();
      }
    );
    app.get("/api/collection/subscriptions", async (req, res) => {
      const subscriptions = await prisma.abonnements.findMany({
        where: {
          users: {
            id: req.user.id,
          },
        },
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          subscriptions.map((subscription: abonnements) => ({
            id: subscription.id,
            publicationCode: `${subscription.country}/${subscription.magazine}`,
            startDate: subscription.startDate.toISOString(),
            endDate: subscription.endDate.toISOString(),
          }))
        )
      );
    });
  },
};
