
import PresentationSentenceApproved from "~emails/presentation-sentence-approved";
import PresentationSentenceRefused from "~emails/presentation-sentence-refused";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { useSocketServices } from "~socket.io-services";
import { SessionUser } from "~dm-types/SessionUser";
import { RequiredAuthMiddleware } from "../auth/util";

export type Decision = "approve" | "refuse";

const listenEvents = () => ({
  approveOrDenyPresentationText: async (
    sentence: string,
    userId: number,
    decision: Decision,
  ) => {
    switch (decision) {
      case "approve":
        const user = await prismaDm.user.update({
          data: {
            presentationText: sentence,
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
  },
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { user: SessionUser }
>("/presentation-text", {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});
