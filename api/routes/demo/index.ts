import { PrismaClient } from "~prisma_clients/client_dm";
import { getHashedPassword } from "~routes/_auth";
import { ExpressCall } from "~routes/_express-call";
import { loginAs } from "~routes/auth/util";

const prisma = new PrismaClient();

export const post = async (
  ...[, res]: ExpressCall<{ resBody: { token: string } }>
) => {
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
