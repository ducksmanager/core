import bodyParser from "body-parser";

import PresentationSentenceApproved from "~emails/presentation-sentence-approved";
import PresentationSentenceRefused from "~emails/presentation-sentence-refused";
import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      params: { decision: string };
      reqBody: { sentence: string; userId: number };
    }>
  ) => {
    const { sentence, userId } = req.body;
    const { decision } = req.params;
    if (!["approve", "refuse"].includes(decision as string)) {
      res.writeHead(400);
      res.end();
      return;
    }

    switch (decision) {
      case "approve":
        const user = await prisma.user.update({
          data: {
            presentationText: sentence as string,
          },
          where: {
            id: userId,
          },
        });
        await new PresentationSentenceApproved({ user }).send();
        break;
      case "refuse":
        await new PresentationSentenceRefused({
          user: await prisma.user.findUniqueOrThrow({
            where: { id: userId },
          }),
        }).send();
    }

    res.writeHead(200);
    res.end();
  },
];
