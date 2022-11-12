import { Handler } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

import { getUser } from "./user";

const prisma = new PrismaClient();
export const post: Handler = async (req, res) => {
  const user = await getUser(req);
  if (!user) {
    res.writeHead(500);
    res.end("This user does not exist");
    return;
  }
  if (!user.lastAccess) {
    console.log(`Initializing last access for user ${req.user.id}`);
  } else if (!user.previousAccess || user.lastAccess < user.previousAccess) {
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
  prisma.user.update({
    data: user,
    where: {
      id: req.user.id,
    },
  });

  res.writeHead(200, { "Content-Type": "application/text" });
  res.end();
};
