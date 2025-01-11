import { useSocketEvents } from "socket-call-server";

import type { SessionUser } from "~dm-types/SessionUser";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import feedbackSent from "../../emails/feedback-sent";
import type { UserSocket } from "../../index";
import namespaces from "../namespaces";

const listenEvents = (socket: UserSocket) => ({
  sendFeedback: async (feedbackMessage: string) => {
    const user = await prismaDm.user.findUniqueOrThrow({
      where: { id: socket.data.user!.id },
    });
    const email = new feedbackSent({
      user,
      feedbackMessage,
    });
    await email.send();
  },
});

export const { client, server } = useSocketEvents<
  typeof listenEvents,
  Record<string, never>,
  Record<string, never>,
  { user: SessionUser }
>(namespaces.FEEDBACK, {
  listenEvents,
  middlewares: [],
});
