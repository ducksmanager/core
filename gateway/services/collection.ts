import bodyParser from "body-parser";
import { Express, Request } from "express";

import { abonnements, PrismaClient } from "../prisma/generated/client_dm";
import { authenticateToken } from "./auth";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

async function upsertSubscription(req: Request) {
  const publicationCodeParts = req.body.publicationCode.split("/");
  const dates = {
    startDate: new Date(Date.parse(req.body.startDate)),
    endDate: new Date(Date.parse(req.body.endDate)),
  };
  await prisma.abonnements.upsert({
    update: dates,
    create: {
      country: publicationCodeParts[0],
      magazine: publicationCodeParts[1],
      users: {
        connect: { ID: req.user.id },
      },
      ...dates,
    },
    where: {
      id: req.params[0] ? parseInt(req.params[0]) : -1,
    },
  });
}

export default {
  addRoutes: (app: Express) => {
    app.all(/^\/api\/collection\/(.+)/, authenticateToken);
    app.post(
      /^\/api\/collection\/subscriptions\/(.+)$/,
      parseForm,
      async (req, res) => {
        await upsertSubscription(req);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end();
      }
    );
    app.put("/api/collection/subscriptions", parseForm, async (req, res) => {
      await upsertSubscription(req);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end();
    });
    app.get("/api/collection/subscriptions", async (req, res) => {
      const subscriptions = await prisma.abonnements.findMany({
        where: {
          users: {
            ID: req.user.id,
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
