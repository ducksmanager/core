import { Namespace, Server } from "socket.io";

import feedbackSent from "~/emails/feedback-sent";
import { prismaDm } from "~/prisma";

import Services from "./types";

export default (io: Server) => {
  (io.of(Services.namespaceEndpoint) as Namespace<Services>).on(
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
    }
  );
};
