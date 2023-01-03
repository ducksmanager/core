import { Handler, Response } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";

import { getUser } from "./user";

const prisma = new PrismaClient();

export type postType = { previousVisit: Date | null };
export const post: Handler = async (req, res: Response<postType>) => {
  const user = await getUser(req.user.id);
  if (!user) {
    res.writeHead(500);
    res.end("This user does not exist");
    return;
  }
  if (!user.lastAccess) {
    console.log(`Initializing last access for user ${req.user.id}`);
    user.previousAccess = null;
    user.lastAccess = new Date();
  } else {
    console.log(`Updating last access for user ${req.user.id}`);
    user.previousAccess = user.lastAccess;
    user.lastAccess = new Date();
  }
  prisma.user.update({
    data: user,
    where: {
      id: req.user.id,
    },
  });

  return res.json({
    previousVisit: user.previousAccess,
  });
};
