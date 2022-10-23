import { Handler, Request } from "express";

import { PrismaClient, user } from "~prisma_clients/client_dm";

const prisma = new PrismaClient();

const exclude = <Key extends keyof user>(
  user: user | null,
  ...keys: Key[]
): Omit<user, Key> | null => {
  if (!user) {
    return user;
  }
  for (const key of keys) {
    delete user[key];
  }
  return user;
};

export const getUser = async (req: Request) =>
  await prisma.user.findUnique({
    where: { id: req.user.id },
  });
export const get: Handler = async (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(exclude(await getUser(req), "password")));
};

export const del: Handler = async (req, res) => {
  const { id: userId } = req.user;
  await prisma.issue.deleteMany({
    where: { userId },
  });
  await prisma.authorUser.deleteMany({
    where: { userId },
  });
  await prisma.purchase.deleteMany({
    where: { userId },
  });
  await prisma.userOption.deleteMany({
    where: { userId },
  });
  await prisma.user.delete({
    where: { id: userId },
  });

  res.writeHead(200);
  res.end();
};
