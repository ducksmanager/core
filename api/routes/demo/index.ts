import { PrismaClient } from "~prisma_clients/client_dm";
import { getHashedPassword } from "~routes/_auth";
import { ExpressCall } from "~routes/_express-call";
import { loginAs } from "~routes/auth/util";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type postCall = Call<{ token: string }>;
export const post = async (...[, res]: ExpressCall<postCall>) => {
  const demoUser = await prisma.user.findFirst({ where: { username: "demo" } });
  if (!demoUser) {
    res.writeHead(500);
    res.end();
  } else {
    const token = await loginAs(
      demoUser,
      getHashedPassword(demoUser!.password)
    );

    return res.json({ token });
  }
};
