import feedbackSent from "~/emails/feedback-sent";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";

import { useSocketServices } from "~socket.io-services";
import { UserSocket } from "../../index";
import { SessionUser } from "~dm-types/SessionUser";

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
  }
});

export const { endpoint, client, server } = useSocketServices<
  typeof listenEvents,
  object,
  object,
  { user: SessionUser }
>("/feedback", {
  listenEvents,
  middlewares: [],
});