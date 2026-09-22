import { useSocketEvents } from "socket-call-server";
import { ev } from "socket-call-server/valibot";
import * as v from "valibot";

import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import PresentationSentenceApproved from "../../emails/presentation-sentence-approved";
import PresentationSentenceRefused from "../../emails/presentation-sentence-refused";
import { RequiredAuthMiddleware } from "../auth/util";
import namespaces from "../namespaces";

export type Decision = "approve" | "refuse";

const listenEvents = () => ({
  approveOrDenyPresentationText: ev(
    v.string(),
    v.number(),
    v.union([v.literal("approve"), v.literal("refuse")]),
  )(async (sentence, userId, decision) => {
    switch (decision) {
      case "approve":
        {
          const user = await prismaDm.user.update({
            data: {
              presentationText: sentence,
            },
            where: {
              id: userId,
            },
          });
          await new PresentationSentenceApproved({ user }).send();
        }
        break;
      case "refuse":
        await new PresentationSentenceRefused({
          user: await prismaDm.user.findUniqueOrThrow({
            where: { id: userId },
          }),
        }).send();
    }
  }),
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>
>(namespaces.PRESENTATION_TEXT, {
  listenEvents,
  middlewares: [RequiredAuthMiddleware],
});

export type ClientEvents = (typeof client)["emitEvents"];
