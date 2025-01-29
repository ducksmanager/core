import { useSocketEvents } from "socket-call-server";

import type { SessionUser } from "~dm-types/SessionUser";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import PresentationSentenceApproved from "../../emails/presentation-sentence-approved";
import PresentationSentenceRefused from "../../emails/presentation-sentence-refused";
import { RequiredAuthMiddleware } from "../auth/util";
import namespaces from "../namespaces";

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

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.PRESENTATION_TEXT, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
