import bodyParser from "body-parser";
import { Express, Request } from "express";

import { PrismaClient } from "../../../prisma/generated/client_dm";

const prisma = new PrismaClient();
const parseForm = bodyParser.json();

async function upsertAuthorUser(req: Request) {
  const { personcode, notation } = req.body;
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  if (
    id &&
    !(await prisma.authorUser.count({
      where: {
        id,
        userId,
      },
    }))
  ) {
    return null;
  }
  await prisma.authorUser.upsert({
    update: {
      notation,
    },
    create: {
      personcode,
      userId,
      ...notation,
    },
    where: {
      id,
    },
  });
}

export default {
  addRoutes: (app: Express) => {
    app.post("/api/collection/authors/:id", parseForm, async (req, res) => {
      await upsertAuthorUser(req);
      res.writeHead(200);
      res.end();
    });
    app.put("/api/collection/authors", parseForm, async (req, res) => {
      await upsertAuthorUser(req);
      res.writeHead(200);
      res.end();
    });
    app.delete("/api/collection/authors/:id", parseForm, async (req, res) => {
      await prisma.authorUser.deleteMany({
        where: {
          id: parseInt(req.params.id) || -1,
          userId: req.user.id,
        },
      });
      res.writeHead(204);
      res.end();
    });
    app.get("/api/collection/authors", async (req, res) => {
      const authorsUsers = await prisma.authorUser.findMany({
        where: {
          userId: req.user.id,
        },
      });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(authorsUsers));
    });
  },
};
