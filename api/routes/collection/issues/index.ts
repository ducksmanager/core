import { issue, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { resetDemo } from "~routes/demo/_reset";

const prisma = new PrismaClient();

export const get = async (...[req, res]: ExpressCall<{ resBody: issue[] }>) => {
  if (req.user!.username === "demo") {
    await resetDemo();
  }
  return res.json(
    await prisma.issue.findMany({
      where: {
        userId: req.user!.id,
      },
    })
  );
};
