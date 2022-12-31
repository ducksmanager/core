import bodyParser from "body-parser";
import { Handler, Response } from "express";

import { PrismaClient } from "~prisma_clients/client_dm";
import { getHashedPassword } from "~routes/_auth";
import { loginAs } from "~routes/auth/util";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export type postType = { token: string };
export const post = [
  parseForm,
  (async (req, res: Response<postType>) => {
    const { username, password } = req.body;
    const hashedPassword = getHashedPassword(password);
    const user = await prisma.user.findFirst({
      where: {
        username,
        password: hashedPassword,
      },
    });
    if (user) {
      const token = await loginAs(user, hashedPassword);

      return res.json({ token });
    } else {
      res.writeHead(401, { "Content-Type": "application/text" });
      res.end();
    }
  }) as Handler,
];
