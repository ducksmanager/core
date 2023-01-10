import bodyParser from "body-parser";

import { PrismaClient } from "~prisma_clients/client_dm";
import { getHashedPassword } from "~routes/_auth";
import { ExpressCall } from "~routes/_express-call";
import { loginAs } from "~routes/auth/util";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export type postCall = Call<
  { token: string },
  undefined,
  { username: string; password: string }
>;
export const post = [
  parseForm,
  async (...[req, res]: ExpressCall<postCall>) => {
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
  },
];
