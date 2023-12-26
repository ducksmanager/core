import { Server } from "socket.io";

import feedbackSent from "~/emails/feedback-sent";
import { prismaDm } from "~/prisma";

import { Namespace } from "./types";

export default (io: Server) => {
  (io.of(Namespace['endpoint']) as Namespace).on("connection", async (socket) => {
    socket.on("sendFeedback", async (feedbackMessage, callback) => {
      const user = await prismaDm.user.findUniqueOrThrow({
        where: { id: socket.data.user!.id },
      });
      const email = new feedbackSent({
        user,
        feedbackMessage,
      });
      await email.send();
      callback()
    })
  })
}
