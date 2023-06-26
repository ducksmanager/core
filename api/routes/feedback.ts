import FeedbackSent from "~emails/feedback-sent";
import { ExpressCall } from "~routes/_express-call";
const prisma = new PrismaClient();
const parseForm = bodyParser.json();
import bodyParser from "body-parser";

import { PrismaClient } from "~/dist/prisma/client_dm";

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      reqBody: {
        feedback: string;
      };
    }>
  ) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.user!.id },
    });
    const email = new FeedbackSent({
      user,
      feedbackMessage: req.body.feedback,
    });
    await email.send();
    return res.end();
  },
];
