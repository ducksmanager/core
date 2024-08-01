import type { Namespace, Server } from "socket.io";

import feedbackSent from "~/emails/feedback-sent";
import { prismaClient as prismaDm } from "~prisma-clients/schemas/dm";

import type Events from "./types";
import { namespaceEndpoint } from "./types";

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on(
    "connection",
    async (socket) => {
      socket.on("sendFeedback", async (feedbackMessage, callback) => {
        const user = await prismaDm.user.findUniqueOrThrow({
          where: { id: socket.data.user!.id },
        });
        const email = new feedbackSent({
          user,
          feedbackMessage,
        });
        await email.send();
        callback();
      });
    },
  );
};
