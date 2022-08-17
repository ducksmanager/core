import { Express, Request } from "express";

import { PrismaClient } from "../../prisma/generated/client_dm";
import { authenticateToken } from "../auth";
import subscription from "./subscription";

const prisma = new PrismaClient();

const getUser = async (req: Request) =>
  await prisma.users.findUnique({
    where: { id: req.user.id },
  });

export default {
  addRoutes: (app: Express) => {
    app.all(/^\/api\/collection\/(.+)/, authenticateToken);

    app.get("/api/collection/issues", async (req, res) => {
      res.writeHead(200);
      res.end(
        JSON.stringify(
          await prisma.numeros.findMany({
            select: {
              id: true,
              country: true,
              magazine: true,
              issueNumber: true,
              condition: true,
              purchaseId: true,
              isToRead: true,
              creationDate: true,
            },
            where: {
              userId: req.user.id,
            },
            orderBy: [
              { country: "asc" },
              { magazine: "asc" },
              { issueNumber: "asc" },
            ],
          })
        )
      );
    });

    app.post("/api/collection/lastvisit", async (req, res) => {
      const user = await getUser(req);
      if (!user) {
        res.writeHead(500);
        res.end("This user does not exist");
        return;
      }
      if (!user.lastAccess) {
        console.log(`"Initializing last access for user ${req.user.id}`);
      } else if (
        !user.previousAccess ||
        user.lastAccess < user.previousAccess
      ) {
        console.log(`"Updating last access for user ${req.user.id}`);
        user.previousAccess = user.lastAccess;
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            previousVisit: user.previousAccess || new Date(),
          })
        );
        return;
      }
      user.lastAccess = new Date();
      prisma.users.update({
        data: user,
        where: {
          id: req.user.id,
        },
      });

      res.writeHead(200);
      res.end();
    });
    subscription.addRoutes(app);
  },
};
