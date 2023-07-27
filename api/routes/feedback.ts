import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import FeedbackSent from "~emails/feedback-sent";
import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      reqBody: {
        feedback: string;
      };
    }>
  ) => {
    const user = await prismaDm.user.findUniqueOrThrow({
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
