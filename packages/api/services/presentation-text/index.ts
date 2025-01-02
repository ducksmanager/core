
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
        const { default: PresentationSentenceApproved } = await import("~emails/presentation-sentence-approved");
        await new PresentationSentenceApproved({ user }).send();
        break;
      case "refuse":
        const { default: PresentationSentenceRefused } = await import("~emails/presentation-sentence-refused");
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

export type ClientEvents = (typeof client)["emitEvents"];