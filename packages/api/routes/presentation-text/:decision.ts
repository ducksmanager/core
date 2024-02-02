import bodyParser from "body-parser";

import { prismaDm } from "~/prisma";
import PresentationSentenceApproved from "~emails/presentation-sentence-approved";
import PresentationSentenceRefused from "~emails/presentation-sentence-refused";
import { ExpressCall } from "~routes/_express-call";

const parseForm = bodyParser.json();

export const post = [
  parseForm,
  async (
    ...[req, res]: ExpressCall<{
      params: { decision: string };
      reqBody: { sentence: string; userId: string };
    }>
  ) => {
    const { sentence, userId: userIdString } = req.body;
    const userId = parseInt(userIdString);
    const { decision } = req.params;
    if (!["approve", "refuse"].includes(decision as string)) {
      res.writeHead(400);
      res.end();
      return;
    }

    switch (decision) {
      case "approve":
        const user = await prismaDm.user.update({
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
          user: await prismaDm.user.findUniqueOrThrow({
            where: { id: userId },
          }),
        }).send();
    }

    res.writeHead(200);
    res.end();
  },
];
