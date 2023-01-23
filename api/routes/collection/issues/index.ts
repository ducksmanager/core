import { issue, PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { resetDemo } from "~routes/demo/_reset";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<issue[]>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
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
