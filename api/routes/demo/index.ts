import { Handler } from "express";

import { PrismaClient } from "~/dist/prisma/client_dm";
import { getHashedPassword, loginAs } from "~/routes/login";
const prisma = new PrismaClient();

export const post: Handler = async (req, res) => {
  const demoUser = await prisma.user.findFirst({ where: { username: "demo" } });
  if (!demoUser) {
    res.writeHead(500);
    res.end();
  } else {
    const token = await loginAs(
      demoUser,
      getHashedPassword(demoUser!.password)
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ token }));
  }
};
